import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import passport from 'passport'
import expressSession from 'express-session'
import { Strategy } from 'passport-github2';
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
const GitHubStrategy = Strategy;
import jwt from 'jsonwebtoken';
import User from "../models/userModel.js"
import UserTokenInfo from "../models/tokenModel.js";

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
    let tokenInfo = await UserTokenInfo.findOne({user_id : profile.id});
    console.log(tokenInfo);
    if(tokenInfo){
      console.log("already had token saved")
      tokenInfo.accessToken=accessToken;
    }
    else{
      console.log("new token");
      tokenInfo= new UserTokenInfo({user_id: profile.id, accessToken: accessToken});
    }
    await tokenInfo.save();
    return done(null, profile);
  }
));

console.log("http://localhost:3000" + process.env.BASE_URL + '/auth/github');

app.get(process.env.BASE_URL + '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get(process.env.BASE_URL + '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  async (req: any, res: any) => {
    // console.log(req.user);
    // console.log("at res");
    // console.log(res)
    // console.log(req.query);
    // console.log(req);
    console.log(req.user.id)
    let tokenInfo = await UserTokenInfo.findOne({ github_username: res.username });
    const token = jwt.sign(tokenInfo.accessToken, process.env.SECRET_KEY);
    console.log(token);
    let user = await User.findOne({username: req.user.username});
    console.log(user);
    res.cookie('accessToken', token, { maxAge: 172800000 });
    if (user !== null) {
      res.redirect("/");
    }
    else {
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
      req.accessToken=decoded
      next();
    }
    else{
      throw new Error("no token found")
    }
  }
  catch (err) {
    res.status(400).json({"error" : err.toString()})
  }
});

app.get("/abc", (req: any, res: any) => {
  console.log(req.user);
  console.log(req.accessToken)
  console.log("here");
  res.send("fjsdilfhgjsio")
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
    console.log(`Server is running on port ${port}`)
  });
})

app.get('/', (req, res) => {
  res.send('Hello World');
}
);
// app.use('/auth',authRoute);