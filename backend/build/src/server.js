var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import expressSession from 'express-session';
import { Strategy } from 'passport-github2';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
const GitHubStrategy = Strategy;
import jwt from 'jsonwebtoken';
import User from "../models/userModel.js";
import UserTokenInfo from "../models/tokenModel.js";
import getRepo from './repoInfo.js';
import getUserInfo from './userInfo.js';
import countPullRequestsForUserAndRepo from './mergedPR_Info.js';
import HacktoberRepo from '../models/repoModel.js';
import UserLeaderboard from '../models/leaderboardModel.js';
import githubLabels from '../models/githubLabels.js';
import cron from 'node-cron';
let access_token = '';
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
app.use(passport.initialize());
app.use(passport.session());
const port = process.env.PORT || 8000;
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URI
}, function (access_token, refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('access_token:', access_token);
        console.log('refreshToken:', refreshToken);
        console.log('profile:', profile);
        let tokenInfo = yield UserTokenInfo.findOne({
            github_id: profile.id
        });
        console.log(tokenInfo);
        if (tokenInfo) {
            console.log("already had token saved");
            tokenInfo.access_token = access_token;
        }
        else {
            console.log("new token");
            tokenInfo = new UserTokenInfo({
                github_id: profile.id,
                access_token: access_token
            });
        }
        yield tokenInfo.save();
        return done(null, profile);
    });
}));
app.use((req, res, next) => {
    console.log(req.originalUrl);
    next();
});
app.get(process.env.BASE_API_PATH, (req, res) => {
    res.send("API HOME");
});
app.get(process.env.HOME_PATH + '/auth/github', passport.authenticate('github', {
    scope: ['user:email']
}));
app.get(process.env.HOME_PATH + '/auth/github/callback', passport.authenticate('github', {
    failureRedirect: process.env.REACT_APP_URL
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user);
    let tokenInfo = yield UserTokenInfo.findOne({
        github_id: res.req.user.id
    });
    const token = jwt.sign(tokenInfo.access_token, process.env.SECRET_KEY);
    console.log("Hello", token);
    let user = yield User.findOne({
        github_id: req.user.id
    });
    console.log(user);
    res.cookie('access_token', token, {
        maxAge: 172800000
    });
    console.log("REGISTER USER");
    res.redirect(process.env.REACT_APP_URL + "/leaderboard");
    return;
}));
app.use((req, res, next) => {
    try {
        console.log('Cookies: ', req.cookies);
        if (req.cookies.access_token) {
            var decoded = jwt.verify(req.cookies.access_token, process.env.SECRET_KEY);
            console.log(decoded);
            req.access_token = decoded;
            next();
        }
        else {
            throw new Error("no token found");
        }
    }
    catch (err) {
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
        console.log(`Server is running on port ${port}`);
    });
});
function updateLeaderboard() {
    return __awaiter(this, void 0, void 0, function* () {
        const tokens = yield UserTokenInfo.find({}).exec();
        const repoArray = [];
        const repos = yield HacktoberRepo.find({}).exec();
        const tokenArray = tokens.map(token => token.access_token);
        const randomIndex = Math.floor(Math.random() * tokenArray.length);
        for (const repo of repos) {
            const repo_name_owner = yield getRepo.getRepo_owner_name(repo.repo_id, tokenArray[randomIndex]);
            repo.owner = repo_name_owner.data.owner.login;
            repo.repo = repo_name_owner.data.name;
            const repoObject = {
                name: repo_name_owner.data.name,
                owner: repo_name_owner.data.owner.login,
            };
            repoArray.push(repoObject);
            yield repo.save();
        }
        yield getRepo.getPRCountsForMultipleRepos(repos, tokenArray[randomIndex]);
        for (const access_token of tokenArray) {
            const userInfo = yield UserTokenInfo.findOne({ access_token: access_token });
            const userData = yield getUserInfo(access_token);
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
            });
            const labels = yield githubLabels.find({}).exec();
            const username = userData.login;
            let total_pr_merged = 0;
            for (const repo of repoArray) {
                const [merged_pr_Data] = yield countPullRequestsForUserAndRepo(username, repo, access_token, labels);
                repo.repo_mergedPR_counts = merged_pr_Data.count;
                total_pr_merged += merged_pr_Data.total_count;
            }
            UserLeaderboard.findOne({ github_id: userInfo.github_id })
                .exec()
                .then((existingLeaderboardData) => {
                if (existingLeaderboardData) {
                    existingLeaderboardData.pull_requests_merged = total_pr_merged;
                    return existingLeaderboardData.save();
                }
                else {
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
    });
}
app.get(process.env.BASE_API_PATH + '/repo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repos = yield HacktoberRepo.find({}).exec();
    console.log("here is repo datas", repos);
    res.send(repos);
}));
app.get(process.env.BASE_API_PATH + '/profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("HERE");
    access_token = req.access_token;
    let tokenInfo = yield UserTokenInfo.findOne({ access_token });
    const userData = {};
    if (tokenInfo && tokenInfo.github_id) {
        yield User.findOne({ github_id: tokenInfo.github_id });
    }
    res.json({ userData });
}));
function createOrUpdateTokenInfo(github_id, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        let tokenInfo = yield UserTokenInfo.findOne({ github_id });
        if (tokenInfo) {
            tokenInfo.access_token = access_token;
        }
        else
            tokenInfo = new UserTokenInfo({ github_id, access_token });
        yield tokenInfo.save();
    });
}
function createLeaderboardEntry(github_id) {
    return __awaiter(this, void 0, void 0, function* () {
        let leaderboardEntry = yield UserLeaderboard.findOne({ github_id });
        console.log(leaderboardEntry);
        if (!leaderboardEntry) {
            leaderboardEntry = new UserLeaderboard({ github_id });
            yield leaderboardEntry.save();
        }
    });
}
app.put(process.env.BASE_API_PATH + "/profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    let body = req.body;
    let userInfo = yield getUserInfo(req.access_token);
    console.log(userInfo);
    if (!body.roll_no || !body.outlook_email || !body.programme || !body.hostel || !body.department || !body.year_of_study) {
        return res.status(400).json({ success: false });
    }
    let user = yield User.findOne({
        github_id: userInfo.id
    });
    if (user !== null) {
        console.log(user.name);
        user.roll_no = req.body.roll_no;
        user.outlook_email = req.body.outlook_email;
        user.programme = req.body.programme;
        user.hostel = req.body.hostel;
        user.department = req.body.department;
        user.year_of_study = req.body.year_of_study;
        yield user.save();
    }
    else {
        console.log("USER NOT FOUND");
        user = new User(Object.assign({ github_id: userInfo.id, github_username: userInfo.login }, body));
        console.log(user);
        yield user.save();
    }
    yield createOrUpdateTokenInfo(user.github_id, req.access_token);
    yield createLeaderboardEntry(user.github_id);
    console.log("UPDATED PROFILE");
    res.json({ success: true });
}));
app.post(process.env.BASE_API_PATH + '/repo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers["moderator-key"] === process.env.MODERATOR_KEY) {
        const { owner, repo, type } = req.body;
        if (!owner || !repo || !type) {
            return res.status(400).json({
                error: 'Please fill all the three entries!'
            });
        }
        const repo_info = yield getRepo.getRepoInfo(owner, repo, req.access_token);
        console.log(repo_info);
        const repo_id = repo_info.id;
        try {
            const existingRepo = yield HacktoberRepo.findOne({
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
            yield newRepo.save();
            return res.status(200).json({
                message: 'Repo added successfully.'
            });
        }
        catch (error) {
            console.error('Error saving the repo:', error);
            return res.status(500).json({
                error: `Internal server error: ${error.toString()}`
            });
        }
    }
    else {
        return res.status(403).json({
            error: 'Invalid secret key.'
        });
    }
}));
cron.schedule('0 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Updating leaderboard");
    updateLeaderboard();
}));
app.get(process.env.BASE_API_PATH + '/leaderboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaderboardEntries = yield UserLeaderboard.find({}).exec();
        console.log(leaderboardEntries);
        const leaderboardData = [];
        for (const entry of leaderboardEntries) {
            const github_id = entry.github_id;
            const userData = yield User.findOne({ github_id: github_id });
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
    }
    catch (error) {
        console.error("Error fetching leaderboard data:", error);
        res.status(500).json({ error: `Internal server error: ${error.toString()}` });
    }
}));
