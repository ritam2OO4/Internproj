const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Business = require('../models/business.model');

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let business = await Business.findOne({ googleId: profile.id });

      if (!business) {
        business = await Business.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          picture: profile.photos[0].value
        });
      }
      return done(null, business);
    } catch (error) {
      return done(error, null);
    }
  }));
}; 