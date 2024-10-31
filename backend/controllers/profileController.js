import User from '../models/userModel.js';
import UserTokenInfo from '../models/tokenModel.js';
import getUserInfo from '../src/userInfo.js';

// controllers/profileController.js

import { createOrUpdateTokenInfo } from './authController.js'; // Adjust import path if needed
import { createLeaderboardEntry } from './leaderboardController.js';

export const updateProfile = async (req, res) => {
  console.log("INSIDE PROFILE");
  let body = req.body;
  
  // Fetch GitHub user info using access_token
  let userInfo = await getUserInfo(req.access_token);
  if (userInfo === undefined) { // Token invalid
    res.redirect(process.env.HOME_PATH + '/auth/github');
    return;
  }

  // Check for missing fields
  const requiredFields = ['roll_no', 'outlook_email', 'programme', 'hostel', 'department', 'year_of_study'];
  const missingEntries = requiredFields.filter(field => !body[field]);
  if (missingEntries.length) {
    return res.status(400).json({ error: `Please fill all the missing entries: ${missingEntries.join(', ')}` });
  }

  // Validate roll number length
  body.roll_no = body.roll_no.toString();
  if (body.roll_no.length !== 9) {
    return res.status(400).json({ error: 'Invalid roll number. Please enter a valid roll number.' });
  }

  // Validate programme and year_of_study
  const validProgrammes = ['B.Tech', 'M.Tech', 'Ph.D', 'M.Sc', 'B.Des', 'M.Des', 'M.S.(R)', 'M.A.', 'MBA', 'MTech+PhD', 'M.S. (Engineering) + PhD'];
  const validYears = ['Freshman', 'Sophomore', 'Pre-Final Yearite', 'Final Yearite'];
  if (!validProgrammes.includes(body.programme)) {
    return res.status(400).json({ error: `Invalid programme. Please enter a valid programme from: ${validProgrammes.join(', ')}` });
  }
  if (!validYears.includes(body.year_of_study)) {
    return res.status(400).json({ error: `Invalid year of study. Please enter a valid year of study from: ${validYears.join(', ')}` });
  }

  // Update or create user profile in the database
  let user = await User.findOne({ github_id: userInfo.id });
  if (user) {
    user.roll_no = body.roll_no;
    user.outlook_email = body.outlook_email;
    user.programme = body.programme;
    user.hostel = body.hostel;
    user.department = body.department;
    user.year_of_study = body.year_of_study;
    await user.save();
  } else {
    user = new User({ github_id: userInfo.id, avatar_url: userInfo.avatar_url, github_username: userInfo.login, ...body });
    await user.save();
  }

  // Update token info and leaderboard
  await createOrUpdateTokenInfo(user.github_id, req.access_token);
  await createLeaderboardEntry(user.github_id);

  console.log("UPDATED PROFILE");
  res.json({ success: true });
};


export const getProfile = async (req, res) => {
    console.log("HERE");
    let access_token = req.access_token;
    let tokenInfo = await UserTokenInfo.findOne({ access_token });
    let userData = {};
    if (tokenInfo && tokenInfo.github_id) {
      userData = await User.findOne({ github_id: tokenInfo.github_id })
    }
    res.json({ userData });
  };

