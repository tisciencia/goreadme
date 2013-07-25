var fs = require('fs')
  , unzip = require('unzip')
  , OpmlParser = require('opmlparser')
  , feedModel = require('../models/feed')
  , userModel = require('../models/user')
  , _ = require('underscore');

exports.importOmpl = function(req, res) {
  if(req.files) {
    userModel.findBy({email: req.session.passport.user._json.email}, function(currentUser) {
      fs.createReadStream(req.files.file.path)
        .pipe(unzip.Parse())
        .on('error', function(error) {
          console.log(error);
        })
        .on('entry', function (entry) {
          var fileName = entry.path;
          if(/subscriptions\.xml/.test(fileName)) {
            entry.pipe(new OpmlParser())
              .on('error', function(error) {
                console.log(error);
              })
              .on('feed', function(feed){
                var newFeed = new feedModel.Model();
                _.extend(newFeed, feed);
                newFeed.user = currentUser._id;
                newFeed.save();
              })
              .on('end', function(){
                console.log('end import opml');
              });
          }
        });
    });
  }
  res.send('');
};
