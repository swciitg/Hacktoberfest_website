import passport from 'passport';
import jwt from 'jsonwebtoken';
import UserTokenInfo from '../models/tokenModel.js';

 const githubAuth = passport.authenticate('github', {
  scope: ['user:email']
});

 const githubCallback = async (req, res) => {
  console.log(req.user);
  let tokenInfo = await UserTokenInfo.findOne({
    github_id: req.user.id
  });
  console.log(req.user.id);
  const token = jwt.sign(tokenInfo.access_token, process.env.SECRET_KEY);
  console.log("Hello", token);
  res.cookie('access_token', token, {
    maxAge: 172800000
  });
  res.redirect(process.env.REACT_APP_URL + "/leaderboard");
  return;
};


const syncGitHubToken = async function (access_token, refreshToken, profile, done) {
  console.log('access_token:', access_token);
  console.log('refreshToken:', refreshToken);
  console.log('profile:', profile);
  let tokenInfo = await UserTokenInfo.findOne({
    github_id: profile.id
  });
  console.log(tokenInfo);
  if (tokenInfo) {
    console.log("already had token saved")
    tokenInfo.access_token = access_token;
  } else {
    console.log("new token");
    tokenInfo = new UserTokenInfo({
      github_id: profile.id,
      access_token: access_token
    });
  }
  await tokenInfo.save();
  return done(null, profile);
};


const createOrUpdateTokenInfo = async function (github_id, access_token) {
  let tokenInfo = await UserTokenInfo.findOne({ github_id });
  if (tokenInfo) {
    tokenInfo.access_token = access_token;
  }
  else tokenInfo = new UserTokenInfo({ github_id, access_token });
  await tokenInfo.save();
}
export {githubCallback, githubAuth, syncGitHubToken, createOrUpdateTokenInfo}