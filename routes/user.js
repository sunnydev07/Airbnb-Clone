const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError.js');
const wrapAsync = require('../utils/wrapAsync.js');
const User = require('../models/user.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const userController = require('../controllers/user.js');
const user = require('../models/user.js');


router.route('/signup').get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));


router.route('/login').get(userController.renderLoginForm)
.post(saveRedirectUrl,   // save redirectUrl before passport clears the session
     passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  userController.login
);

// router.get('/login',userController.renderLoginForm);

router.get('/logout', userController.logout);

module.exports = router;