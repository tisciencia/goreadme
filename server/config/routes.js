'use strict';

var passport = require('passport');

module.exports = function(app) {
  var home = require('../controllers/home')
    , authentication = require('../controllers/authentication')
    , subscriptions = require('../controllers/subscriptions')
    , feedImport = require('../controllers/import');

  app.get('/', home.index);

  app.get('/list-feeds', subscriptions.listFeeds);
  app.post('/add-subscription', subscriptions.create);

  app.post('/import-opml', feedImport.importOmpl);

  app.get('/login/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'] }),
      function(req, res){
  });
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login/google' }), authentication.googleCallback);
};