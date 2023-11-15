var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      var profileData = {
        name: profile.displayName,
        email: profile._json.email,
        username: profile.username,
        photo: profile._json.avatar_url,
      };

      // Before saving the obtained userInfo, check if the user exists in the db. If not create and save.
      var user = await User.findOne({ email: profile._json.email });
      if (!user) {
        var createdUser = await User.create(profileData);
        done(null, createdUser);
      } else {
        done(null, user);
      }
    }
  )
);

passport.use(
  // we are using Straegy - passport-google-oauth2
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
      // scope: ['email', 'profile'],
    },
    async (request, accessToken, refreshToken, profile, done) => {
      console.log(profile);
      var profileData = {
        name: profile.displayName,
        email: profile.email,
        username: profile.given_name,
        photo: profile.picture,
      };

      // Before saving the obtained userInfo, check if the user exists in the db. If not create and save.
      var user = await User.findOne({ email: profile.email });
      if (!user) {
        var createdUser = await User.create(profileData);
        done(null, createdUser);
      } else {
        done(null, user);
      }
    }
  )
);

console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET);

//Local Login Authentication using Passport - strategy -> passport-local
//This module lets you authenticate using a username and password in your Node.js applications
passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
);

// from the Strategy function, it takes the user as a param and adds his user.id into the "session". The cookie in browser should have a sessionid now.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// puts the user information into the "req object"
passport.deserializeUser(async (id, done) => {
  var foundUser = await User.findById(id);
  done(null, foundUser);
});
