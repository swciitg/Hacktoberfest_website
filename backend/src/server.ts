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
import cron from 'node-cron';

let accessToken = '';
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
      github_id: profile.id
    });
    console.log(tokenInfo);
    if (tokenInfo) {
      console.log("already had token saved")
      tokenInfo.accessToken = accessToken;
    } else {
      console.log("new token");
      tokenInfo = new UserTokenInfo({
        github_id: profile.id,
        accessToken: accessToken
      });
    }
    await tokenInfo.save();
    return done(null, profile);
  }
));

app.get(process.env.BASE_API_PATH,(req,res) => {
  res.send("API HOME");
});

app.get(process.env.HOME_PATH + '/auth/github',
  passport.authenticate('github', {
    scope: ['user:email']
  }));

app.get(process.env.HOME_PATH + '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: process.env.REACT_APP_URL
  }),
  async (req: any, res: any) => {
    console.log(req.user);
    // console.log("at res");
    // console.log(res)
    // console.log(req.query);
    // console.log(req);
    console.log(req.user)
    let tokenInfo = await UserTokenInfo.findOne({
      github_id: res.req.user.id
    });
    const token = jwt.sign(tokenInfo.accessToken, process.env.SECRET_KEY);
    console.log("Hello", token);
    let user = await User.findOne({
      github_id: req.user.id
    });
    console.log(user);
    res.cookie('accessToken', token, {
      maxAge: 172800000
    });
    res.redirect(process.env.REACT_APP_URL+"/register");
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
  
  const tokenArray = tokens.map(token => token.accessToken);
  const randomIndex = Math.floor(Math.random() * tokenArray.length);
  for (const repo of repos) {
    const repo_name_owner = await getRepo.getRepo_owner_name(repo.repo_id,tokenArray[randomIndex]);
    repo.repo_owner=repo_name_owner.data.owner.login;
    repo.repo_name=repo_name_owner.data.name;
    const repoObject = {
      name: repo_name_owner.data.name,
      owner: repo_name_owner.data.owner.login,
    };
    repoArray.push(repoObject);
    await repo.save();
  }
  await getRepo.getPRCountsForMultipleRepos(repos, tokenArray[randomIndex]);
  for (const accessToken of tokenArray) {
    const userInfo = await UserTokenInfo.findOne({ accessToken: accessToken });
    const userData = await getUserInfo(accessToken);
    User.findOne({github_id:userInfo.github_id})
    .exec()
    .then((existingUser)=>{
       if(existingUser){
        existingUser.github_username=userData.login;
        existingUser.avatar_url=userData.avatar_url;
        return existingUser.save();
       }
    })
    .catch((error)=>{
      console.error("Error while updating User data:", error);
    })
    
    const username = userData.login;
    let total_pr_merged = 0;
    for (const repo of repoArray) {
      const [pr_Data, merged_pr_Data] = await countPullRequestsForUserAndRepo(username, repo, accessToken);
      repo.repo_mergedPR_counts=merged_pr_Data.count;
      total_pr_merged += merged_pr_Data.total_count;
    }
    UserLeaderboard.findOne({ github_id : userInfo.github_id })
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

app.get(process.env.BASE_API_PATH + '/repo', async (req: any, res: any) => {
const repoArray = [];
const repos = await HacktoberRepo.find({}).exec();
for (const repo of repos) {
  const repoObject = {
    name: repo.repo_name,
    owner: repo.repo_owner,
  };

  repoArray.push(repoObject);
}
console.log("here is repo datas",repos);
  res.send(repos);
});

app.get(process.env.BASE_API_PATH + '/profile', async (req: any, res: any) => {
  console.log("HERE");
  accessToken = req.accessToken;
  const userData = await getUserInfo(accessToken);
  res.json({ userData });
})


async function createOrUpdateTokenInfo(github_id,accessToken){
  let tokenInfo = await UserTokenInfo.findOne({github_id});
  if(tokenInfo){
    tokenInfo.accessToken=accessToken;
  }
  else tokenInfo = new UserTokenInfo({github_id,accessToken});
  await tokenInfo.save();
}

async function createLeaderboardEntry(github_id){
  let leaderboardEntry = await UserLeaderboard.findOne({github_id});
  console.log(leaderboardEntry);
  if(!leaderboardEntry){
    leaderboardEntry = new UserLeaderboard({github_id});
    await leaderboardEntry.save();
  }
}

app.put(process.env.BASE_API_PATH + "/profile", async (req : any, res) => {
  console.log(req.body);
  let body = req.body;
  let userInfo = await getUserInfo(req.accessToken);
  console.log(userInfo);
  if ( !body.roll_no || !body.outlook_email || !body.programme || !body.hostel || !body.department || !body.year_of_study) {
    return res.status(400).json({ success: false });
  }
  let user = await User.findOne({
    github_id: userInfo.id
  });
  if (user !== null) {
    user.github_id = userInfo.id;
    user.roll_no = req.body.roll_no;
    user.outlook_email = req.body.outlook_email;
    user.programme = req.body.programme;
    user.hostel = req.body.hostel;
    user.department = req.body.department;
    user.year_of_study = req.body.year_of_study;
    await user.save();
  } else {
    console.log("USER NOT FOUND");
    user = new User({github_id : userInfo.id,...body});
    console.log(user);
    await user.save();
  }
  await createOrUpdateTokenInfo(user.github_id,req.accessToken);
  await createLeaderboardEntry(user.github_id);
  console.log("UPDATED PROFILE");
  res.json({ success: true });
});


app.post(process.env.BASE_API_PATH + '/repo', async (req: any, res: any) => {

  if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
    const {
      repo_owner,
      repo_name
    } = req.body;

    if (!repo_owner || !repo_name) {
      return res.status(400).json({
        error: 'Both repo_owner and repo_name are required.'
      });
    }
     const repo_info=await getRepo.getRepoInfo(repo_owner,repo_name,req.accessToken);
     const repo_id=repo_info.id;
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
        repo_owner,
        repo_name,
        repo_id
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

cron.schedule('0 * * * *',async () => {
  console.log("Updating leaderboard");
  updateLeaderboard();
})

app.get(process.env.BASE_API_PATH + '/leaderboard', async (req: any, res: any) => {
  try {
    const leaderboardEntries = await UserLeaderboard.find({}).exec();
    console.log(leaderboardEntries);
    const leaderboardData = [];
    for (const entry of leaderboardEntries) {
      const github_id = entry.github_id;
      const userData = await User.findOne({github_id:github_id});
      if(userData){
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
    res.status(500).json({ error: "Internal server error" });
  }
});
