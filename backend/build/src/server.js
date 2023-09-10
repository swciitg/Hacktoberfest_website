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
import getPRCountsForMultipleRepos from './repoInfo.js';
import getUserInfo from './userInfo.js';
import countPullRequestsForUserAndRepo from './mergedPR_Info.js';
import HacktoberRepo from '../models/repoModel.js';
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
    origin: process.env.APP_URL,
    credentials: true,
}));
app.use(passport.initialize());
app.use(passport.session());
const port = process.env.PORT || 8000;
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URI
}, function (accessToken, refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('accessToken:', accessToken);
        console.log('refreshToken:', refreshToken);
        console.log('profile:', profile);
        let tokenInfo = yield UserTokenInfo.findOne({
            user_id: profile.id
        });
        console.log(tokenInfo);
        if (tokenInfo) {
            console.log("already had token saved");
            tokenInfo.accessToken = accessToken;
        }
        else {
            console.log("new token");
            tokenInfo = new UserTokenInfo({
                user_id: profile.id,
                accessToken: accessToken
            });
        }
        yield tokenInfo.save();
        return done(null, profile);
    });
}));
console.log("http://localhost:3000" + process.env.BASE_URL + '/auth/github');
app.get(process.env.BASE_URL + '/auth/github', passport.authenticate('github', {
    scope: ['user:email']
}));
app.get(process.env.BASE_URL + '/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/'
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.user);
    // console.log("at res");
    // console.log(res)
    // console.log(req.query);
    // console.log(req);
    console.log(req.user.id);
    let tokenInfo = yield UserTokenInfo.findOne({
        github_username: res.username
    });
    const token = jwt.sign(tokenInfo.accessToken, process.env.SECRET_KEY);
    console.log("Hello", token);
    let user = yield User.findOne({
        username: req.user.username
    });
    console.log(user);
    res.cookie('accessToken', token, {
        maxAge: 172800000
    });
    if (user !== null) {
        res.redirect("/");
    }
    else {
        res.redirect("/abc");
    }
    console.log("here");
    return;
}));
app.use((req, res, next) => {
    try {
        console.log('Cookies: ', req.cookies);
        if (req.cookies.accessToken) {
            var decoded = jwt.verify(req.cookies.accessToken, process.env.SECRET_KEY);
            console.log(decoded);
            req.accessToken = decoded;
            next();
        }
        else {
            throw new Error("no token found");
        }
    }
    catch (err) {
        res.status(400).json({
            "error": err.toString()
        });
    }
});
app.get("/abc", (req, res) => {
    console.log(req.user);
    accessToken = req.accessToken;
    console.log(req.accessToken);
    console.log("here");
    res.send("fjsdilfhgjsio");
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
app.get('/', (req, res) => {
    res.send('Hello World');
});
const leaderboard_data = [];
function updateLeaderboard(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokens = yield UserTokenInfo.find({}).exec();
        const repos = yield HacktoberRepo.find({}).exec();
        const repoArray = repos.map(repo => ({
            name: repo.repo_name,
            owner: repo.repo_owner,
        }));
        const tokenArray = tokens.map(token => token.accessToken);
        leaderboard_data.length = 0;
        for (const accessToken of tokenArray) {
            const userData = yield getUserInfo(accessToken);
            const avatar_url = userData.avatar_url;
            const username = userData.login;
            let total_pr_merged = 0;
            for (const repo of repoArray) {
                const [pr_Data, merged_pr_Data] = yield countPullRequestsForUserAndRepo(username, repo, accessToken);
                total_pr_merged += merged_pr_Data.total_count;
            }
            leaderboard_data.push({ username, avatar_url, total_pr_merged });
        }
    });
}
app.get('/landing_page', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    accessToken = req.accessToken;
    const repos = yield HacktoberRepo.find({}).exec();
    const repoArray = repos.map(repo => repo.repo_name);
    const repoData = yield getPRCountsForMultipleRepos(repoArray, accessToken);
    res.send(repoData);
    console.log(repoData);
}));
app.get('/user_profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    accessToken = req.accessToken;
    const userData = yield getUserInfo(accessToken);
    res.send(userData);
    console.log(userData);
}));
app.put("/update_profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    let user = yield User.findOne({ github_username: req.body.github_username });
    if (user !== null) {
        user.github_profile_name = req.body.github_profile_name;
        user.roll_no = req.body.roll_no;
        user.outlook_email = req.body.outlook_email;
        user.programme = req.body.programme;
        user.hostel = req.body.hostel;
        user.department = req.body.department;
        user.year_of_study = req.body.year_of_study;
        yield user.save();
        res.send("Updated");
    }
    else {
        res.send("User not found");
    }
}));
app.post('/repo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.secret_key === process.env.SECRET_KEY) {
        const { repo_owner, repo_name } = req.body;
        if (!repo_owner || !repo_name) {
            return res.status(400).json({ error: 'Both repo_owner and repo_name are required.' });
        }
        try {
            const existingRepo = yield HacktoberRepo.findOne({ repo_owner, repo_name });
            if (existingRepo) {
                return res.status(409).json({ error: 'Repository already exists in the database.' });
            }
            const newRepo = new HacktoberRepo({ repo_owner, repo_name });
            yield newRepo.save();
            return res.status(200).json({ message: 'Repo added successfully.' });
        }
        catch (error) {
            console.error('Error saving the repo:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }
    else {
        return res.status(403).json({ error: 'Invalid secret key.' });
    }
}));
app.get('/leaderboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    accessToken = req.accessToken;
    yield updateLeaderboard(req, res);
    res.send(leaderboard_data);
}));
