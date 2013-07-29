var request = require('request')
  , feed = require('../models/feed')
  , user = require('../models/user');

exports.listFeeds = function(req, res) {
  res.send('');
};

exports.create = function(req, res) {
  var feedUrl = req.body.url;

  var apiUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'";
  apiUrl += encodeURIComponent(feedUrl);
  apiUrl += "'&format=json&callback=processFeed";

  function processFeed(subscription) {
    var newSubscription = new feed.Model()
      , channel;

    user.findBy({ email: req.session.passport.user._json.email }, function(currentUser) {
      newSubscription.user = currentUser._id;
      if(subscription.query.results.rss) {
        channel = subscription.query.results.rss.channel;
        feed.findBy({ htmlurl: channel.link[0] }, function(currentFeed) {
          if (!currentFeed) {
            newSubscription.title = channel.title;
            newSubscription.description = channel.description;
            newSubscription.language = channel.language;
            newSubscription.htmlurl = channel.link[0];
            newSubscription.xmlurl = channel.link[1].href;
            newSubscription.updated = channel.lastBuildDate;
            newSubscription.type = 'rss';
            newSubscription.save();
          }
        });
      } else {
        channel = subscription.query.results.feed;
        feed.findBy({ htmlurl: channel.id }, function(currentFeed) {
          if (!currentFeed) {
            newSubscription.title = channel.title;
            newSubscription.language = channel.language;
            newSubscription.htmlurl = channel.id;
            newSubscription.xmlurl = channel.link[0].href;
            newSubscription.updated = channel.updated;
            newSubscription.type = 'atom';
            newSubscription.save();
          }
        });
      }
    });
  }

  request(apiUrl, function(error, response, body) {
    if(error) {
      console.log('error: ' + error);
    }

    eval(body);
  });

  res.send('');
}
