'use strict';

var passport = require('passport');

module.exports = function(app) {
  var home = require('../controllers/home')
    , authentication = require('../controllers/authentication')
    , subscriptions = require('../controllers/subscriptions')
    , feedImport = require('../controllers/import')
    , items = require('../controllers/items')
    , options = require('../controllers/options')
    , folders = require('../controllers/folders');

  app.get('/', home.index);

  // subscriptions
  app.post('/subscription', authentication.verifyUserAuthenticated, subscriptions.create);  // '/add-subscription'
  app.delete('/subscriptions', authentication.verifyUserAuthenticated, subscriptions.delete); // '/subscriptions/unsubscribe'
  app.put('/subscriptions', authentication.verifyUserAuthenticated, subscriptions.rename); // '/subscriptions/rename'
  app.get('/subscriptions', authentication.verifyUserAuthenticated, subscriptions.listFeeds); // 'list-feeds'

  // items
  app.put('/items/mark-read', authentication.verifyUserAuthenticated, items.markAsRead); // /item/mark-read
  app.put('/items/mark-unread', authentication.verifyUserAuthenticated, items.markAsUnread);
  app.put('/items/mark-starred', authentication.verifyUserAuthenticated, items.markStarred);
  app.get('/items/:feedUrl', authentication.verifyUserAuthenticated, items.listItemsFromFeed); // /item/get-contents/:feedUrl'
  app.post('/items', authentication.verifyUserAuthenticated, items.getContents); // '/item/get-contents'

  // options
  app.post('/options', authentication.verifyUserAuthenticated, options.save); // '/options/save'

  // folders
  app.post('/folders', authentication.verifyUserAuthenticated, folders.create); // 'subscriptions/move-to-folder'
  app.put('/folders', authentication.verifyUserAuthenticated, folders.rename); // '/folders/rename'

  // imports
  app.post('/imports/opml', authentication.verifyUserAuthenticated, feedImport.importOmpl); // '/import-opml'

  // session ou authentication
  app.get('/session,
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'] }),
      function(req, res){
  });  // 'login/google'
  app.get('/session/callback',
    passport.authenticate('google', { failureRedirect: '/login/google' }), authentication.googleCallback); // '/auth/google/callback'
  app.delete('/session', authentication.logout);  // '/logout'
};