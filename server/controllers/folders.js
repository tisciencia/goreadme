var user = require('../models/user')
  , feed = require('../models/feed')
  , async = require('async');

exports.rename = function(req, res) {
  var userEmail = req.session.passport.user._json.email
    , currentUser
    , body = req.body;

  async.series([
    function(callback) {
      user.findBy({ email: userEmail }, function(cUser) {
        currentUser = cUser;
        callback();
      });
    },
    function(callback) {
      feed.findAllBy({ user: currentUser._id, folder: body.folderName }, function(subscriptions) {
        if(subscriptions && subscriptions.length > 0) {
          async.each(subscriptions,
            function(subscription, cb) {
              subscription.folder = body.newFolderName;
              subscription.save();
              cb();
            },
          function(err) {
            callback(err);
          });
        } else {
          callback();
        }
      });
    }
  ],
  function(error) {
    res.send('');
  });
}
