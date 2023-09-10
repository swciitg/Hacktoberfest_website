import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import expressSession from 'express-session';
import { Strategy } from 'passport-github2';
import mongoose from 'mongoose';
const GitHubStrategy = Strategy;
import jwt from 'jsonwebtoken';
const app = express();
dotenv.config();
// app.use(cors());
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
//   app.use(cors({
//     origin: "*",
//     credentials: true,
// }))
app.use(passport.initialize());
app.use(passport.session());
const port = process.env.PORT || 8000;
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URI
}, function (accessToken, refreshToken, profile, done) {
    console.log('accessToken:', accessToken);
    console.log('refreshToken:', refreshToken);
    console.log('profile:', profile);
    return done(null, profile);
}));
console.log("http://localhost:3000" + process.env.BASE_URL + '/auth/github');
app.get(process.env.BASE_URL + '/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get(process.env.BASE_URL + '/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    console.log(res);
    const token = jwt.sign({ username: res.username }, process.env.SECRET_KEY, { expiresIn: "5d" });
    res.redirect('/');
});
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (id, done) {
    done(null, { id });
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
// app.use('/auth',authRoute);
