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
import getPRCountsForMultipleRepos from './repoInfo.js'
import getUserInfo from './userInfo.js'
import countPullRequestsForUserAndRepo from './mergedPR_Info.js'
import HacktoberRepo from '../models/repoModel.js'
import UserLeaderboard from '../models/leaderboardModel.js'
import cron from 'node-cron';

let accessToken = '';
const app = express();
dotenv.config();
// app.use(cors());
app.use(cookieParser());
app.use(express.json());

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

app.use(cors({
  origin: process.env.APP_URL as string,
  credentials: true,
}))

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT || 8000;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URI
  },
  async function (accessToken: any, refreshToken: any, profile: any, done: any) {
    console.log('accessToken:', accessToken);
    console.log('refreshToken:', refreshToken);
    console.log('profile:', profile);
    let tokenInfo = await UserTokenInfo.findOne({
      user_id: profile.id
    });
    console.log(tokenInfo);
    if (tokenInfo) {
      console.log("already had token saved")
      tokenInfo.accessToken = accessToken;
    } else {
      console.log("new token");
      tokenInfo = new UserTokenInfo({
        user_id: profile.id,
        accessToken: accessToken
      });
    }
    await tokenInfo.save();
    return done(null, profile);
  }
));

console.log("http://localhost:3000" + process.env.BASE_URL + '/auth/github');

app.get(process.env.BASE_URL + '/auth/github',
  passport.authenticate('github', {
    scope: ['user:email']
  }));

app.get(process.env.BASE_URL + '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/'
  }),
  async (req: any, res: any) => {
    // console.log(req.user);
    // console.log("at res");
    // console.log(res)
    // console.log(req.query);
    // console.log(req);
    console.log(req.user.id)
    let tokenInfo = await UserTokenInfo.findOne({
      github_username: res.username
    });
    const token = jwt.sign(tokenInfo.accessToken, process.env.SECRET_KEY);
    console.log("Hello", token);
    let user = await User.findOne({
      username: req.user.username
    });
    console.log(user);
    res.cookie('accessToken', token, {
      maxAge: 172800000
    });
    if (user !== null) {
      res.redirect("/");
    } else {
      res.redirect("/abc");
    }
    console.log("here")
    return;
  });

app.use((req: any, res: any, next: any) => {
  try {
    console.log('Cookies: ', req.cookies);
    if (req.cookies.accessToken) {
      var decoded = jwt.verify(req.cookies.accessToken, process.env.SECRET_KEY);
      console.log(decoded)
      req.accessToken = decoded
      next();
    } else {
      throw new Error("no token found")
    }
  } catch (err) {
    res.status(400).json({
      "error": err.toString()
    })
  }
});

app.get("/abc", (req: any, res: any) => {
  console.log(req.user);
  accessToken = req.accessToken;
  console.log(req.accessToken)
  console.log("here");
  res.send("fjsdilfhgjsio")
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

app.get('/', (req, res) => {
  res.send('Hello World');
});


async function updateLeaderboard() {
  const tokens = await UserTokenInfo.find({}).exec();
  const repos = await HacktoberRepo.find({}).exec();
  const repoArray = repos.map(repo => ({
    name: repo.repo_name,
    owner: repo.repo_owner,
  }));
  const tokenArray = tokens.map(token => token.accessToken);
  for (const accessToken of tokenArray) {
    const user=await UserTokenInfo.findOne({accessToken:accessToken});
    const userData = await getUserInfo(accessToken);
    const username = userData.login;
    let total_pr_merged = 0;
    for (const repo of repoArray) {
      const [pr_Data, merged_pr_Data] = await countPullRequestsForUserAndRepo(username, repo, accessToken);
      total_pr_merged += merged_pr_Data.total_count;
    }
    UserLeaderboard.findOne({ user_id: user._id })
  .exec()
  .then((existingLeaderboardData) => {
    if (existingLeaderboardData) {
      existingLeaderboardData.pull_requests_merged = total_pr_merged;
      return existingLeaderboardData.save();
    } else {
      const leaderboardData = new UserLeaderboard({
        user_id: user._id,
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

app.get('/landing_page', async (req: any, res: any) => {
  accessToken = req.accessToken;
  const repos = await HacktoberRepo.find({}).exec();
  const repoArray = repos.map(repo => ({
    name: repo.repo_name,
    owner: repo.repo_owner,
  }));
  console.log(repoArray);
  const repoData = await getPRCountsForMultipleRepos(repoArray, accessToken);
  res.send(repoData);
  console.log(repoData);
})

app.get('/user_profile', async (req: any, res: any) => {
  accessToken = req.accessToken;
  const userData = await getUserInfo(accessToken);
  res.send(userData);
  console.log(userData);
})

app.put("/update_profile", async (req, res) => {
  console.log(req.body);
  let user = await User.findOne({
    github_username: req.body.github_username
  });
  if (user !== null) {
    user.github_profile_name = req.body.github_profile_name;
    user.roll_no = req.body.roll_no;
    user.outlook_email = req.body.outlook_email;
    user.programme = req.body.programme;
    user.hostel = req.body.hostel;
    user.department = req.body.department;
    user.year_of_study = req.body.year_of_study;
    await user.save();
    res.send("Updated");
  } else {
    res.send("User not found");
  }
});


app.post('/repo', async (req: any, res: any) => {

  if (req.body.secret_key === process.env.SECRET_KEY) {
    const {
      repo_owner,
      repo_name
    } = req.body;

    if (!repo_owner || !repo_name) {
      return res.status(400).json({
        error: 'Both repo_owner and repo_name are required.'
      });
    }

    try {
      const existingRepo = await HacktoberRepo.findOne({
        repo_owner,
        repo_name
      });

      if (existingRepo) {
        return res.status(409).json({
          error: 'Repository already exists in the database.'
        });
      }
      const newRepo = new HacktoberRepo({
        repo_owner,
        repo_name
      });
      await newRepo.save();

      return res.status(200).json({
        message: 'Repo added successfully.'
      });
    } catch (error) {
      console.error('Error saving the repo:', error);
      return res.status(500).json({
        error: 'Internal server error.'
      });
    }
  } else {
    return res.status(403).json({
      error: 'Invalid secret key.'
    });
  }
});

 cron.schedule('0 * * * *',()=>{
  console.log("Updating leaderboard");
  updateLeaderboard();
 })

 app.get('/leaderboard', async (req: any, res: any) => {
  try {
    const leaderboardEntries = await UserLeaderboard.find({}).exec();
    console.log(leaderboardEntries);
    const leaderboardData = [];

    for (const entry of leaderboardEntries) {
      const userId = entry.user_id;
      const token = await UserTokenInfo.findOne({ _id: userId }).exec();
     
      if (token) {
        const userData = await getUserInfo(token.accessToken);
        const avatar_url = userData.avatar_url;
        const username = userData.login;
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
    res.status(500).json({ error: "Internal server error" });
  }
});
