'use strict';

var passport = require('passport');

module.exports = function(app) {
  var home = require('../controllers/home')
    , authentication = require('../controllers/authentication')
    , subscriptions = require('../controllers/subscriptions')
    , feedImport = require('../controllers/import')
    , items = require('../controllers/items')
    , options = require('../controllers/options');

  app.get('/', home.index);

  app.get('/list-feeds', authentication.verifyUserAuthenticated, subscriptions.listFeeds);
  app.post('/add-subscription', authentication.verifyUserAuthenticated, subscriptions.create);
  app.post('/subscriptions/unsubscribe', authentication.verifyUserAuthenticated, subscriptions.delete);
  app.post('/subscriptions/move-to-folder', authentication.verifyUserAuthenticated, subscriptions.moveToFolder);

  app.post('/item/mark-read', authentication.verifyUserAuthenticated, items.markAsRead);
  app.post('/item/mark-unread', authentication.verifyUserAuthenticated, items.markAsUnread);
  app.post('/item/mark-starred', authentication.verifyUserAuthenticated, items.markStarred);
  app.post('/user/get-contents', function(req, res){res.send('')}); // change this

  app.post('/options/save', authentication.verifyUserAuthenticated, options.save);

  app.post('/import-opml', authentication.verifyUserAuthenticated, feedImport.importOmpl);

  app.get('/login/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'] }),
      function(req, res){
  });
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login/google' }), authentication.googleCallback);
  app.get('/logout', authentication.logout);
};