var request = require('request')
  , icon = require('../models/icon');

exports.findIconFor = function(feed, cb) {
  var iconUrl
    , htmlUrl = feed.htmlurl;

  if(!htmlUrl) {
    cb();
    return;
  }

  if(htmlUrl[htmlUrl.length-1] === '/') {
    htmlUrl = htmlUrl.substring(0, htmlUrl.length-1);
  }
  iconUrl = htmlUrl + '/favicon.ico';


  request(iconUrl, function(error, response, body) {
    if(error) {
      if(typeof(cb) === 'function') cb(null);
    } else if (response.headers['content-type'] === 'image/x-icon') {

      icon.findBy({ iconUrl: iconUrl }, function(iconFound) {
        var newIcon;
        if(!iconFound) {
          newIcon = new icon.Model({htmlUrl: feed.htmlurl, iconUrl: iconUrl});
          newIcon.save(function() {
            if(typeof(cb) === 'function') cb(iconUrl);
          });
        } else {
          if(typeof(cb) === 'function') cb(iconUrl);
        }
      });
    }
    else {
      if(typeof(cb) === 'function') cb();
    }
  });
}
