import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import githubLabel from "../models/githubLabels.js";
import leaderboardModel from "../models/leaderboardModel.js";
import repoModel from "../models/repoModel.js";
import userModel from "../models/userModel.js";
import tokenModel from "../models/tokenModel.js";
import adminControl from "../models/adminControl.js";

const ADMINPANELROOT = process.env.BASE_API_PATH + "/admin";

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_PANEL_EMAIL,
  password: process.env.ADMIN_PANEL_PASSWORD
};

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return DEFAULT_ADMIN;
  }
  return null;
};

mongoose.connect(process.env.MONGO_URL);

const adminOptions = {
  resources: [
    githubLabel,
    leaderboardModel,
    repoModel,
    userModel,
    tokenModel,
    adminControl
  ],
  rootPath: ADMINPANELROOT,
  loginPath: ADMINPANELROOT + "/login",
  logoutPath: ADMINPANELROOT + "/logout"
};

const admin = new AdminJS(adminOptions);

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate,
  cookieName: "adminjs",
  cookiePassword: "sessionsecret",
}, null, {
  resave: false,
  saveUninitialized: true,
  secret: "sessionsecret",
});

export { admin, adminRouter };