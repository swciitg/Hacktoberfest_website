import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import passport from 'passport'
import expressSession from 'express-session'
import {
  Strategy
} from 'passport-github2';
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
const GitHubStrategy = Strategy;
import jwt from 'jsonwebtoken';
import User from "../models/userModel.js"
import UserTokenInfo from "../models/tokenModel.js";
import getRepo from './repoInfo.js'
import getUserInfo from './userInfo.js'
import countPullRequestsForUserAndRepo from './mergedPR_Info.js'
import HacktoberRepo from '../models/repoModel.js'
import UserLeaderboard from '../models/leaderboardModel.js'
import githubLabels from '../models/githubLabels.js'
import cron from 'node-cron';
import path from 'path';
import fs from "fs";
import { fileURLToPath } from 'url';

const app = express();
dotenv.config();
const corsConfig = {
  origin: true,
  credentials: true,
};

//Add request parsers
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(cookieParser());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(path.join(__dirname, '..', 'build'));

app.use('/hacktoberfest', express.static(path.join(__dirname, '..', 'build')));

app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 8000;

app.use((req, res, next) => {
  console.log(req.originalUrl);
  next();
});

app.get(process.env.BASE_API_PATH, (req, res) => {
  res.send("API HOME");
});

app.get(process.env.BASE_API_PATH + '/leaderboard', async (req, res) => {
  try {
    console.log("LEADERBOARD");
    const leaderboardEntries = await UserLeaderboard.find({}).exec();
    console.log(leaderboardEntries);
    const leaderboardData = [];
    for (const entry of leaderboardEntries) {
      const github_id = entry.github_id;
      const userData = await User.findOne({ github_id: github_id });
      if (userData) {
        const avatar_url = userData.avatar_url;
        const username = userData.github_username;
        const total_pr_merged = entry.pull_requests_merged;
        leaderboardData.push({
          username,
          avatar_url,
          total_pr_merged
        });
      }
    }
    console.log(leaderboardData);
    res.send(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ error: `Internal server error: ${error.toString()}` });
  }
});

app.get(process.env.BASE_API_PATH + '/repo', async (req, res) => {
  const repos = await HacktoberRepo.find({}).exec();
  console.log("here is repo datas", repos);
  res.send(repos);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URI
},
  async function (access_token, refreshToken, profile, done) {
    console.log('access_token:', access_token);
    console.log('refreshToken:', refreshToken);
    console.log('profile:', profile);
    let tokenInfo = await UserTokenInfo.findOne({
      github_id: profile.id
    });
    console.log(tokenInfo);
    if (tokenInfo) {
      console.log("already had token saved")
      tokenInfo.access_token = access_token;
    } else {
      console.log("new token");
      tokenInfo = new UserTokenInfo({
        github_id: profile.id,
        access_token: access_token
      });
    }
    await tokenInfo.save();
    return done(null, profile);
  }
));

app.get(process.env.HOME_PATH + '/auth/github',
  passport.authenticate('github', {
    scope: ['user:email']
  }));

app.get(process.env.HOME_PATH + '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: process.env.REACT_APP_URL
  }),
  async (req, res) => {
    console.log(req.user);
    let tokenInfo = await UserTokenInfo.findOne({
      github_id: req.user.id
    });
    console.log(req.user.id);
    const token = jwt.sign(tokenInfo.access_token, process.env.SECRET_KEY);
    console.log("Hello", token);
    res.cookie('access_token', token, {
      maxAge: 172800000
    });
    res.redirect(process.env.REACT_APP_URL + "/leaderboard");
    return;
  });

app.use((req, res, next) => {
  try {
    if(req.originalUrl===process.env.BASE_API_PATH + '/profile'){
    console.log('Cookies: ', req.cookies);
    if (req.cookies.access_token) {
      var decoded = jwt.verify(req.cookies.access_token, process.env.SECRET_KEY);
      console.log(decoded)
      req.access_token = decoded
      next();
    } else {
      throw new Error("no token found")
    }
  }
  else next();
  } catch (err) {
    console.log(err);
    res.redirect(process.env.HOME_PATH + '/auth/github');
  }
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  done(null, {
    id
  });
});

mongoose.connect(process.env.MONGO_URL, {}).then(() => {
  console.log("mongodb connected");
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  });
})


async function updateLeaderboard() {
  const tokens = await UserTokenInfo.find({}).exec();
  const repoArray = [];
  const repos = await HacktoberRepo.find({}).exec();

  const tokenArray = tokens.map(token => token.access_token);
  const randomIndex = Math.floor(Math.random() * tokenArray.length);
  for (const repo of repos) {
    const repo_name_owner = await getRepo.getRepo_owner_name(repo.repo_id, tokenArray[randomIndex]);
    repo.owner = repo_name_owner.data.owner.login;
    repo.repo = repo_name_owner.data.name;
    const repoObject = {
      name: repo_name_owner.data.name,
      owner: repo_name_owner.data.owner.login,
    };
    repoArray.push(repoObject);
    await repo.save();
  }
  await getRepo.getPRCountsForMultipleRepos(repos, tokenArray[randomIndex]);
  for (const access_token of tokenArray) {
    const userInfo = await UserTokenInfo.findOne({ access_token: access_token });
    const userData = await getUserInfo(access_token);
    User.findOne({ github_id: userInfo.github_id })
      .exec()
      .then((existingUser) => {
        if (existingUser) {
          existingUser.github_username = userData.login;
          existingUser.avatar_url = userData.avatar_url;
          return existingUser.save();
        }
      })
      .catch((error) => {
        console.error("Error while updating User data:", error);
      })
    const labels = await githubLabels.find({}).exec();
    const username = userData.login;
    let total_pr_merged = 0;
    for (const repo of repoArray) {
      const [merged_pr_Data] = await countPullRequestsForUserAndRepo(username, repo, access_token, labels);
      repo.repo_mergedPR_counts = merged_pr_Data.count;
      total_pr_merged += merged_pr_Data.total_count;
    }
    UserLeaderboard.findOne({ github_id: userInfo.github_id })
      .exec()
      .then((existingLeaderboardData) => {
        if (existingLeaderboardData) {
          existingLeaderboardData.pull_requests_merged = total_pr_merged;
          return existingLeaderboardData.save();
        } else {
          const leaderboardData = new UserLeaderboard({
            github_id: userInfo.github_id,
            pull_requests_merged: total_pr_merged,
          });
          return leaderboardData.save();
        }
      })
      .then(() => {
        console.log("Leaderboard data saved successfully");
      })
      .catch((error) => {
        console.error("Error while saving leaderboard data:", error);
      });

  }
}

app.get(process.env.BASE_API_PATH + '/profile', async (req, res) => {
  console.log("HERE");
  let access_token = req.access_token;
  let tokenInfo = await UserTokenInfo.findOne({ access_token });
  let userData = {};
  if (tokenInfo && tokenInfo.github_id) {
    userData = await User.findOne({ github_id: tokenInfo.github_id })
  }
  res.json({ userData });
})


async function createOrUpdateTokenInfo(github_id, access_token) {
  let tokenInfo = await UserTokenInfo.findOne({ github_id });
  if (tokenInfo) {
    tokenInfo.access_token = access_token;
  }
  else tokenInfo = new UserTokenInfo({ github_id, access_token });
  await tokenInfo.save();
}

async function createLeaderboardEntry(github_id) {
  let leaderboardEntry = await UserLeaderboard.findOne({ github_id });
  console.log(leaderboardEntry);
  if (!leaderboardEntry) {
    leaderboardEntry = new UserLeaderboard({ github_id });
    await leaderboardEntry.save();
  }
}

app.put(process.env.BASE_API_PATH + "/profile", async (req, res) => {
  console.log("INSIDE PROFILE");
  console.log(req);
  console.log(req.body);
  let body = req.body;
  let userInfo = await getUserInfo(req.access_token);
  console.log(userInfo);
  if (!body.roll_no || !body.outlook_email || !body.programme || !body.hostel || !body.department || !body.year_of_study) {
    return res.status(400).json({ success: false });
  }
  let user = await User.findOne({
    github_id: userInfo.id
  });
  if (user !== null) {
    console.log(user.name)
    user.roll_no = req.body.roll_no;
    user.outlook_email = req.body.outlook_email;
    user.programme = req.body.programme;
    user.hostel = req.body.hostel;
    user.department = req.body.department;
    user.year_of_study = req.body.year_of_study;
    await user.save();
  } else {
    console.log("USER NOT FOUND");
    user = new User({ github_id: userInfo.id, github_username: userInfo.login, ...body });
    console.log(user);
    await user.save();
  }
  await createOrUpdateTokenInfo(user.github_id, req.access_token);
  await createLeaderboardEntry(user.github_id);
  console.log("UPDATED PROFILE");
  res.json({ success: true });
});


app.post(process.env.BASE_API_PATH + '/repo', async (req, res) => {

  if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
    const {
      owner,
      repo,
      type
    } = req.body;

    if (!owner || !repo || !type) {
      return res.status(400).json({
        error: 'Please fill all the three entries!'
      });
    }
    const repo_info = await getRepo.getRepoInfo(owner, repo, req.access_token);
    console.log(repo_info);
    const repo_id = repo_info.id;
    try {
      const existingRepo = await HacktoberRepo.findOne({
        repo_id
      });

      if (existingRepo) {
        return res.status(409).json({
          error: 'Repository already exists in the database.'
        });
      }
      const newRepo = new HacktoberRepo({
        owner,
        repo,
        repo_id,
        avatar_url: repo_info.avatar_url,
        type
      });
      await newRepo.save();

      return res.status(200).json({
        message: 'Repo added successfully.'
      });
    } catch (error) {
      console.error('Error saving the repo:', error);
      return res.status(500).json({
        error: `Internal server error: ${error.toString()}`
      });
    }
  } else {
    return res.status(403).json({
      error: 'Invalid secret key.'
    });
  }
});

cron.schedule('0 * * * *', async () => {
  console.log("Updating leaderboard");
  updateLeaderboard();
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});