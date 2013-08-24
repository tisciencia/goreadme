var passport = require('passport')
  , settings = require('./google-settings')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , user = require('../models/user');

passport.serializeUser(function(user, done) {
    done(null, user._json.email);
});

passport.deserializeUser(function(email, done) {
    user.findBy({email: email}, function(user) {
        done(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: settings.GOOGLE_CLIENT_ID,
    clientSecret: settings.GOOGLE_CLIENT_SECRET,
    callbackURL: settings.GOOGLE_CALLBACK
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));
