var async = require('async')
  , option = require('../models/option')
  , user = require('../models/user');

exports.save = function(req, res) {

  var options = req.body.options
    , emailUser = req.session.passport.user._json.email
    , currentUser;

  async.series([
    function (callback) {
      user.findBy({email: emailUser}, function(cUser) {
        currentUser = cUser;
        callback(null);
      });
    },
    function (callback) {
      option.findBy({user: currentUser._id}, function(userOption) {
        if(!userOption) {
          userOption = new option.Model();
          userOption.user = currentUser._id;
        }
        userOption.userOptions = options;
        userOption.save(function() {
          callback(null);
        });
      })
    }
  ], function(error) {
    if(error) {
      console.log(error);
    }
    res.send('');
  })
}
