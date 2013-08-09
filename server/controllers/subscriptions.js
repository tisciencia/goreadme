var request = require('request')
  , feed = require('../models/feed')
  , user = require('../models/user')
  , feedItem = require('../models/feedItem')
  , _ = require('underscore');

exports.listFeeds = function(req, res) {
  var subscriptions = {};
  user.findBy({ email: req.session.passport.user._json.email }, function(currentUser) {
    feed.findAllBy({ user: currentUser._id }, function(subscriptionsFromUser) {

      if(subscriptionsFromUser && subscriptionsFromUser.length > 0) {

        subscriptionsFromUser.forEach(addItemsToSubscription);

        subscriptions = _.map(subscriptionsFromUser, function(subscription) {
          return {
            title: subscription.title,
            xmlurl: subscription.xmlurl,
            htmlurl: subscription.htmlurl,
            items: subscription.items,
            itemsCount: subscription.items.length
          }
        });
      }
      res.json(subscriptions);
    });
  });
};

exports.create = function(req, res) {
  var feedUrl = req.body.url;

  var apiUrl = queryFeedUrl(feedUrl);

  function processFeed(queryResults) {
    var newSubscription = new feed.Model()
      , channel;

    user.findBy({ email: req.session.passport.user._json.email }, function(currentUser) {
      newSubscription.user = currentUser._id;
      if(queryResults.query.results.rss) {
        channel = queryResults.query.results.rss.channel;
        feed.findBy({ htmlurl: channel.link[0] }, function(currentFeed) {
          if (!currentFeed) {
            newSubscription.title = channel.title;
            newSubscription.description = channel.description;
            newSubscription.language = channel.language;
            newSubscription.htmlurl = channel.link[0];
            newSubscription.xmlurl = channel.link[1].href || req.body.url;
            newSubscription.updated = channel.lastBuildDate;
            newSubscription.type = 'rss';
            newSubscription.save();
            addItemsToSubscription(newSubscription, queryResults);
          }
        });
      } else {
        channel = queryResults.query.results.feed;
        feed.findBy({ htmlurl: channel.id }, function(currentFeed) {
          if (!currentFeed) {
            newSubscription.title = channel.title;
            newSubscription.language = channel.language;
            newSubscription.htmlurl = channel.id;
            newSubscription.xmlurl = channel.link[0].href || req.body.url;
            newSubscription.updated = channel.updated;
            newSubscription.type = 'atom';
            newSubscription.save();
            addItemsToSubscription(newSubscription, queryResults);
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


function queryFeedUrl(feedUrl, callback) {
  var apiUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'";
  var callbackName = callback || "processFeed";
  apiUrl += encodeURIComponent(feedUrl);
  apiUrl += "'&format=json&callback=" + callbackName;

  return apiUrl;
}

function addItemsToSubscription (subscription, queryResults) {
  function updateSubscription(queryResult) {
    var itemExist, newFeedItem;
    if(queryResult.query.results.rss) {
      queryResult.query.results.rss.channel.item.forEach(function(item) {
        itemExist = _.find(subscription.items, function(i) { return i.link === item.link});
        if(!itemExist) {
          newFeedItem = new feedItem.Model();
          newFeedItem.link = item.link;
          newFeedItem.title = item.title;
          newFeedItem.description = item.description;
          newFeedItem.content = item.encoded;
          newFeedItem.publishedDate = item.pubDate;
          newFeedItem.author = item.creator;
          subscription.items.push(newFeedItem);
          newFeedItem.save();
          subscription.save();
        }
      });
    } else {
      queryResult.query.results.feed.entry.forEach(function(item) {
        itemExist = _.find(subscription.items, function(i) { return i.link === item.link.href});
        if(!itemExist) {
          newFeedItem = new feedItem.Model();
          newFeedItem.link = item.link.href;
          newFeedItem.title = item.title.content;
          newFeedItem.description = item.content.content;
          newFeedItem.content = item.content.content;
          newFeedItem.publishedDate = item.updated;
          newFeedItem.author = "";
          subscription.items.push(newFeedItem);
          newFeedItem.save();
          subscription.save();
        }
      });
    }
  }
  if(!isNaN(queryResults)) {
    var apiUrl = queryFeedUrl(subscription.xmlurl, "updateSubscription");
    request(apiUrl, function(error, response, body) {
      if(error) {
        console.log('error: ' + error);
      }
      eval(body);
    });
  } else {
    updateSubscription(queryResults);
  }

}