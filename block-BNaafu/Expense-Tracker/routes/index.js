var express = require('express');
const passport = require('passport');
var User = require('../models/User');
var router = express.Router();

var nodemailer = require('../modules/nodemailer');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

// Routes for passport authentication success/failure
router.get('/success', function (req, res, next) {
  res.render('success');
});
router.get('/failure', function (req, res, next) {
  res.render('failure');
});

//When this below endpoint is hit (which is triggered by an <a> in index.ejs) we will pass the control over to passport which will talk to GitHub Server
router.get('/auth/github', passport.authenticate('github'));

// GitHub will get back on this route
router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/failure',
  }),
  (req, res, next) => {
    res.redirect('/dashboard');
  }
);

// For GOOGLE
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/failure',
  })
);

//--------------------------------------------------------------------------------------------
// Local Login (using passport strategy - passport-local) NOT-IMPLEMENTED YET
router.get('/register', (req, res, next) => {
  res.render('register');
});
router.post('/register', async (req, res, next) => {
  try {
    var newUser = await User.create(req.body);
    console.log(`inside user.create() router`);

    // Send a verification email using the function
    nodemailer.sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.redirect('/localLogin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/login', (req, res, next) => {
  res.render('loginForm');
});

// Handle login
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true, // Enable flash messages for failed login
  })
);

// router.post('/login', async (req, res, next) => {
//   const { email, password } = req.body;

//   // Check credentials against the database
//   const user = await User.findOne({ email });

//   if (!user || !user.verifyPassword(password)) {
//     return res.redirect('/login'); // Redirect on login failure
//   }

//   // Create a session and redirect on successful login
//   req.session.user = user;

//   res.redirect('/dashboard');
// });

//for passport local stategy login routes
router.get('/localLogin', (req, res, next) => {
  res.render('loginForm');
});

router.post(
  '/localLogin',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/failure',
  })
);

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

module.exports = router;
