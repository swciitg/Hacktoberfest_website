// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyAccessToken = (req, res, next) => {
  try {
    // Check if request is for the profile route
    if (req.originalUrl === process.env.BASE_API_PATH + '/profile') {
      console.log('Cookies: ', req.cookies);

      // Check if access_token is in cookies
      if (req.cookies.access_token !== undefined) {
        // Verify and decode token
        const decoded = jwt.verify(req.cookies.access_token, process.env.SECRET_KEY);
        console.log(decoded);

        // Attach decoded token to request object
        req.access_token = decoded;
        next();
      } else {
        console.log("No token found");
        // Redirect to GitHub auth if no token is found
        return res.redirect(process.env.HOME_PATH + '/auth/github');
      }
    } else {
      next(); // Continue if not the profile route
    }
  } catch (err) {
    console.log(err);
    // Redirect on any verification error
    res.redirect(process.env.HOME_PATH + '/auth/github');
  }
};
