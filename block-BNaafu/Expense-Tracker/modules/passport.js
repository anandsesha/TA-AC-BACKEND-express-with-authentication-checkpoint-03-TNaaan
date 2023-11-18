var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');
var bcrypt = require('bcrypt');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);

        // Find the user based on the OAuth ID and provider
        const user = await User.findOne({
          'logins.method': 'github',
          'logins.oauthId': profile.id,
        });

        if (!user) {
          // If the user doesn't exist, create a new user
          const profileData = {
            name: profile.displayName,
            email: profile._json.email,
            username: profile.username,
            photo: profile._json.avatar_url,
            logins: [
              {
                method: 'github',
                oauthId: profile.id,
                providerId: profile.id,
                accessToken: accessToken,
              },
            ],
          };

          const createdUser = await User.create(profileData);
          return done(null, createdUser);
        } else {
          // If the user exists, update the access token (if needed) and return the user
          if (user.logins[0].accessToken !== accessToken) {
            user.logins[0].accessToken = accessToken;
            await user.save();
          }
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);

        // Find the user based on the OAuth ID and provider
        const user = await User.findOne({
          'logins.method': 'google',
          'logins.oauthId': profile.sub,
        });

        if (!user) {
          // If the user doesn't exist, create a new user
          const profileData = {
            name: profile.displayName,
            email: profile.email,
            username: profile.given_name,
            photo: profile.picture,
            logins: [
              {
                method: 'google',
                oauthId: profile.sub, // can use profile.id here as well. Its the same as profile.sub
                providerId: profile.sub,
                accessToken: accessToken,
              },
            ],
          };

          const createdUser = await User.create(profileData);
          return done(null, createdUser);
        } else {
          // If the user exists, update the access token (if needed) and return the user
          if (user.logins[0].accessToken !== accessToken) {
            user.logins[0].accessToken = accessToken;
            await user.save();
          }
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET);

//Local Login Authentication using Passport - strategy -> passport-local
//This module lets you authenticate using a username and password in your Node.js applications
// passport.use(
//   new LocalStrategy(function (username, password, done) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false);
//       }
//       if (!user.verifyPassword(password)) {
//         return done(null, false);
//       }
//       return done(null, user);
//     });
//   })
// );

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
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
