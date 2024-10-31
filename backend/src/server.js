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
import cron from 'node-cron';
import path from 'path';
import fs from "fs";
import { fileURLToPath } from 'url';
import { adminRouter } from '../admin_panel/admin-config.js';
import {getLeaderboard, updateLeaderboard, createLeaderboardEntry} from '../controllers/leaderboardController.js'
import { repoData, addRepo, deleteRepo } from '../controllers/repoController.js'
import { addLabel } from '../controllers/labelController.js'
import { githubAuth, githubCallback, syncGitHubToken,createOrUpdateTokenInfo } from '../controllers/authController.js'
import { getProfile, updateProfile } from '../controllers/profileController.js'
import { verifyAccessToken } from '../middlewares/authMiddleware.js';

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

//getleaderboard 
app.get(process.env.BASE_API_PATH + '/leaderboard',getLeaderboard );

//get repo function
app.get(process.env.BASE_API_PATH + '/repo',repoData );

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URI
}, syncGitHubToken)); // Remove the immediate invocation

//git authenticatiom
app.get(process.env.HOME_PATH + '/auth/github',
  githubAuth);
  
//callback
app.get(process.env.HOME_PATH + '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: process.env.REACT_APP_URL
  }),githubCallback
  );


  app.use(verifyAccessToken);



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



//get profile
app.get(process.env.BASE_API_PATH + '/profile',getProfile )

//updtae or create token info

//create leaderboard entry

//porfile update
app.put(process.env.BASE_API_PATH + "/profile", updateProfile);


//cretae label
app.post(process.env.BASE_API_PATH + '/label',addLabel );
//create repo
app.post(process.env.BASE_API_PATH + '/repo',addRepo );
//delete repo
app.delete(process.env.BASE_API_PATH + '/repo',deleteRepo);

cron.schedule('0 * * * *', async () => {
  console.log("Updating leaderboard");
  updateLeaderboard();
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});