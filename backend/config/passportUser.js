const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

module.exports = (passport) => {
  passport.use('google-user',  // 👈 Use a unique name for User auth
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_USERID,
        clientSecret: process.env.GOOGLE_CLIENT_USERSECRET,
        callbackURL: 'https://internprojbackend.onrender.com/api/user/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              picture: profile.photos[0].value,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};
