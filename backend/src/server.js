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
import getUserInfo, { getUserById } from './userInfo.js'
import countPullRequestsForUserAndRepo, { fetchMergedPRsForRepo } from './mergedPR_Info.js'
import HacktoberRepo from '../models/repoModel.js'
import UserLeaderboard from '../models/leaderboardModel.js'
import githubLabels from '../models/githubLabels.js'
import cron from 'node-cron';
import path from 'path';
import fs from "fs";
import { fileURLToPath } from 'url';
import { adminRouter } from '../admin_panel/admin-config.js'

const app = express();
dotenv.config();
const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(`${process.env.BASE_API_PATH}/admin`, adminRouter);

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
    // console.log("LEADERBOARD");
    const leaderboardEntries = await UserLeaderboard.find({}).exec();
    // console.log(leaderboardEntries);
    const leaderboardData = [];
    for (const entry of leaderboardEntries) {
      const github_id = entry.github_id;
      const userData = await User.findOne({ github_id: github_id });
      const total_points = entry.points;
      if (userData) {
        const avatar_url = userData.avatar_url;
        const username = userData.github_username;
        const total_pr_merged = entry.pull_requests_merged;
        leaderboardData.push({
          username,
          avatar_url,
          total_pr_merged,
          total_points
        });
      }
    }
    leaderboardData.sort((a, b) => b.total_pr_merged - a.total_pr_merged);
    // console.log(leaderboardData);
    res.send(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ error: `Internal server error: ${error.toString()}` });
  }
});

app.get(process.env.BASE_API_PATH + '/repo', async (req, res) => {
  const repos = await HacktoberRepo.find({}).exec();
  // console.log("here is repo datas", repos);
  res.send(repos);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URI
},
  async function (access_token, refreshToken, profile, done) {
    // console.log('access_token:', access_token);
    // console.log('refreshToken:', refreshToken);
    // console.log('profile:', profile);
    let tokenInfo = await UserTokenInfo.findOne({
      github_id: profile.id
    });
    // console.log(tokenInfo);
    if (tokenInfo) {
      // console.log("already had token saved")
      tokenInfo.access_token = access_token;
    } else {
      // console.log("new token");
      tokenInfo = new UserTokenInfo({
        github_id: profile.id,
        access_token: access_token
      });
    }
    await tokenInfo.save();
    const avatar_url = profile._json?.avatar_url || profile.photos?.[0]?.value;
    if (profile.username) {
      await User.updateOne(
        { github_id: profile.id },
        { $set: { github_username: profile.username, ...(avatar_url && { avatar_url }) } }
      );
    }
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
    // console.log(req.user);
    let tokenInfo = await UserTokenInfo.findOne({
      github_id: req.user.id
    });
    // console.log(req.user.id);
    const token = jwt.sign(tokenInfo.access_token, process.env.SECRET_KEY);
    // console.log("Hello", token);
    res.cookie('access_token', token, {
      maxAge: 172800000
    });
    res.redirect(process.env.REACT_APP_URL + "/leaderboard");
    return;
  });

app.use((req, res, next) => {
  try {
    if (req.originalUrl === process.env.BASE_API_PATH + '/profile') {
      // console.log('Cookies: ', req.cookies);
      if (req.cookies.access_token !== undefined) {
        var decoded = jwt.verify(req.cookies.access_token, process.env.SECRET_KEY);
        // console.log(decoded)
        req.access_token = decoded
        next();
      } else {
        // console.log("no token found");
        res.redirect(process.env.HOME_PATH + '/auth/github');
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
    updateLeaderboard();
  });
})


async function updateLeaderboard() {
  try {
    const repos = await HacktoberRepo.find({}).exec();
    if (!repos || repos.length === 0) {
      console.log("No repositories configured to update.");
      return;
    }

    // Resolve token: prefer GITHUB_SERVER_TOKEN, fallback to any valid user token
    const tokens = await UserTokenInfo.find({}).exec();
    const tokenArray = tokens.map(token => token.access_token).filter(Boolean);
    const serverToken = process.env.GITHUB_SERVER_TOKEN || (tokenArray.length > 0 ? tokenArray[0] : null);

    if (!serverToken) {
      console.warn("No GITHUB_SERVER_TOKEN configured and no user tokens available. Skipping leaderboard update.");
      return;
    }

    // Phase 1: Update repository statistics (total PRs, merged PRs, tech stacks, avatar, stars)
    console.log("Updating repository statistics...");
    await getRepo.getPRCountsForMultipleRepos(repos, serverToken);

    // Phase 2: Flipped Leaderboard Sync (1 query per repository)
    console.log("Syncing leaderboard with merged pull requests...");
    const labels = await githubLabels.find({}).exec();
    // Keyed by numeric GitHub id so counts survive username changes.
    const userPRCounts = {};
    const authorProfiles = {};

    for (const repo of repos) {
      const repoOwner = repo.owner;
      const repoName = repo.repo;
      console.log(`Fetching merged PRs for ${repoOwner}/${repoName}...`);
      const prs = await fetchMergedPRsForRepo(repoOwner, repoName, serverToken, labels);

      for (const pr of prs) {
        if (pr.user && pr.user.id != null) {
          const authorId = String(pr.user.id);
          userPRCounts[authorId] = (userPRCounts[authorId] || 0) + 1;
          authorProfiles[authorId] = { login: pr.user.login, avatar_url: pr.user.avatar_url };
        }
      }
    }

    // Update all registered users in MongoDB without deleting inactive accounts
    const registeredUsers = await User.find({}).exec();
    for (const user of registeredUsers) {
      const githubId = String(user.github_id);
      const mergedCount = userPRCounts[githubId] || 0;

      const githubProfile = authorProfiles[githubId] || await getUserById(githubId, serverToken);
      if (githubProfile && githubProfile.login &&
        (githubProfile.login !== user.github_username || githubProfile.avatar_url !== user.avatar_url)) {
        await User.updateOne(
          { _id: user._id },
          { $set: { github_username: githubProfile.login, avatar_url: githubProfile.avatar_url } }
        );
      }

      await UserLeaderboard.updateOne(
        { github_id: user.github_id },
        {
          $set: {
            pull_requests_merged: mergedCount
          }
        },
        { upsert: true }
      );
    }

    console.log(`Leaderboard updated successfully for ${registeredUsers.length} registered users across ${repos.length} repositories.`);
  } catch (err) {
    console.error("Error while saving leaderboard data:", err);
  }
}

app.get(process.env.BASE_API_PATH + '/profile', async (req, res) => {
  // console.log("HERE");
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
  // console.log(leaderboardEntry);
  if (!leaderboardEntry) {
    leaderboardEntry = new UserLeaderboard({ github_id });
    await leaderboardEntry.save();
  }
}

app.put(process.env.BASE_API_PATH + "/profile", async (req, res) => {
  // console.log("INSIDE PROFILE");
  // console.log(req);
  // console.log(req.body);
  let body = req.body;
  let userInfo = await getUserInfo(req.access_token);
  // console.log(userInfo);
  if (userInfo === undefined) { // token invalid
    res.redirect(process.env.HOME_PATH + '/auth/github');
    return;
  }
  const email = body.email || body.outlook_email;
  const mobile_number = body.mobile_number;
  const college = body.college;
  const year_of_study = body.year_of_study;
  const roll_no = body.roll_no ? body.roll_no.toString().trim() : '';
  const programme = body.programme;

  const missingEntries = [];
  if (!email) missingEntries.push('email');
  if (!mobile_number) missingEntries.push('mobile_number');
  if (!college) missingEntries.push('college');
  if (!year_of_study) missingEntries.push('year_of_study');
  if (!roll_no) missingEntries.push('roll_no');
  if (!programme) missingEntries.push('programme');

  if (missingEntries.length > 0) {
    const missingEntriesString = missingEntries.join(', ');
    return res.status(400).json({
      error: `Please fill all the missing entries: ${missingEntriesString}`
    });
  }

  let user = await User.findOne({
    github_id: userInfo.id
  });

  const profileData = {
    roll_no,
    email,
    mobile_number,
    college,
    year_of_study,
    programme,
    outlook_email: email,
    hostel: body.hostel || user?.hostel,
    department: body.department || user?.department
  };

  if (user !== null) {
    Object.assign(user, profileData);
    await user.save();
  } else {
    user = new User({
      github_id: userInfo.id,
      avatar_url: userInfo.avatar_url,
      github_username: userInfo.login,
      ...profileData
    });
    await user.save();
  }
  await createOrUpdateTokenInfo(user.github_id, req.access_token);
  await createLeaderboardEntry(user.github_id);
  // console.log("UPDATED PROFILE");
  res.json({ success: true });
});

app.post(process.env.BASE_API_PATH + '/label', async (req, res) => {
  if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
    const { label } = req.body;
    const githubLabelInfo = githubLabels({ label_type: label });
    await githubLabelInfo.save();
    res.json({ success: true, message: "posted label successfully" });
  }
  else {
    return res.status(403).json({
      error: 'Invalid secret key.'
    });
  }
});

app.post(process.env.BASE_API_PATH + '/repo', async (req, res) => {

  if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
    const {
      owner,
      repo,
      type
    } = req.body;
    try {
      if (!owner || !repo || !type) {
        return res.status(400).json({
          error: 'Please fill all the three entries!'
        });
      }
      const tokens = await UserTokenInfo.find({}).exec();
      const tokenArray = tokens.map(token => token.access_token).filter(Boolean);
      const repoToken = process.env.GITHUB_SERVER_TOKEN || (tokenArray.length > 0 ? tokenArray[0] : null);
      if (!repoToken) {
        return res.status(503).json({ error: 'No GitHub token available. Please set GITHUB_SERVER_TOKEN or log in with GitHub first.' });
      }
      const repo_info = await getRepo.getRepoInfo(owner, repo, repoToken);
      // console.log(repo_info);
      const repo_id = repo_info.id;
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
        avatar_url: repo_info.owner.avatar_url,
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

app.delete(process.env.BASE_API_PATH + '/repo', async (req, res) => {

  if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
    const { owner, repo } = req.body;

    try {

      if (!owner || !repo) {
        return res.status(400).json({
          error: 'Please provide both the owner and the repo name!'
        });
      }


      const repoToDelete = await HacktoberRepo.findOne({ owner, repo });


      if (!repoToDelete) {
        return res.status(404).json({
          error: 'Repository not found in the database.'
        });
      }


      await HacktoberRepo.deleteOne({ _id: repoToDelete._id });

      return res.status(200).json({
        message: 'Repo deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting the repo:', error);
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
