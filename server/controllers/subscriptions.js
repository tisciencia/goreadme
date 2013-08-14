var request = require('request')
  , feed = require('../models/feed')
  , user = require('../models/user')
  , option = require('../models/option')
  , feedItem = require('../models/feedItem')
  , icon = require('../models/icon')
  , iconFinder = require('../lib/iconFinder')
  , _ = require('underscore')
  , async = require('async');

exports.listFeeds = function(req, res) {
  var subscriptions = []
    , userEmail = req.session.passport.user._json.email
    , currentUser;

  async.series([
    function (callback) {
      user.findBy({ email: userEmail }, function(cUser) {
        currentUser = cUser;
        callback(null);
      });
    },
    function(callback) {
      var userOptions = "";
      option.findBy({ user: currentUser._id }, function(options) {
        if(options) {
          userOptions = options.userOptions;
        }
        callback(null, userOptions);
      })
    },
    function(callback) {
      feed.findAllBy({ user: currentUser._id }, 'items', function(subscriptionsFromUser) {
        if(subscriptionsFromUser && subscriptionsFromUser.length > 0) {

          subscriptionsFromUser.forEach(addItemsToSubscription);

          subscriptionsFromUser.forEach(function(subscription) {
            if(subscription.folder) {
              var folder = _.find(subscriptions, function(s) {return s.outline && s.title === subscription.folder});
              if(folder) {
                folder.outline.push(convertToSimpleSubscription(subscription));
              } else {
                subscriptions.push({
                  outline: [convertToSimpleSubscription(subscription)],
                  title: subscription.folder
                });
              }
            } else {
              subscriptions.push(convertToSimpleSubscription(subscription));
            }
          });
        }
        callback(null, subscriptions);
      });
    },
    function(callback) {
      var urls = _.map(subscriptions, function(s){ return s.htmlurl || "" });
      icon.findAllBy(urls, function(iconsFound) {
        var iconsToReturn = {};
        if(iconsFound) {

          iconsFound.forEach(function(i) {
            iconsToReturn[i.htmlUrl] = i.iconUrl;
          });
          callback(null, iconsToReturn);
        } else {
          callback(null);
        }
      });
    }
  ], function(error, results){
    if(error) {
      console.log(error);
    }
    res.json({ options: results[1], subscriptions: results[2], icons: results[3] });
  });
};

exports.create = function(req, res) {
  var feedUrl = req.body.url
    , apiUrl;

  async.series([
    function(callback) {
      apiUrl = queryFeedUrl(feedUrl);
      callback(null, apiUrl)
    },
    function(callback) {
      function processFeed(queryResults) {
        var newSubscription = new feed.Model()
          , channel
          , htmlUrl;

        if(!queryResults.query || !queryResults.query.results) {
          res.send(500, 'The url informed is not a valid feed url');
          return;
        }

        user.findBy({ email: req.session.passport.user._json.email }, function(currentUser) {
          newSubscription.user = currentUser._id;
          if(queryResults.query.results.rss) {
            channel = queryResults.query.results.rss.channel;
            if(typeof(channel.link) === 'string') {
              htmlUrl = channel.link;
            } else if (channel.link[0].href) {
              htmlUrl = channel.link[0].href;
            } else if (typeof(channel.link[0]) === 'string') {
              htmlUrl = channel.link[0];
            }

            feed.findBy({ user: currentUser._id, htmlurl: htmlUrl }, function(currentFeed) {
              if (!currentFeed) {
                newSubscription.title = channel.title;
                newSubscription.description = channel.description;
                newSubscription.language = channel.language;
                newSubscription.htmlurl = htmlUrl;
                newSubscription.xmlurl = req.body.url;
                newSubscription.updated = channel.lastBuildDate;
                newSubscription.type = 'rss';
                newSubscription.save(function() {
                  addItemsToSubscription(newSubscription, queryResults);
                  iconFinder.findIconFor(newSubscription);
                  callback(null, '');
                });
              } else {
                callback(null);
              }
            });
          } else {
            channel = queryResults.query.results.feed;
            feed.findBy({ user: currentUser._id, htmlurl: channel.id }, function(currentFeed) {
              if (!currentFeed) {
                if(typeof(channel.title) === 'string') {
                  newSubscription.title = channel.title;
                } else if (channel.title.content) {
                  newSubscription.title = channel.title.content;
                }
                newSubscription.language = channel.language;
                newSubscription.htmlurl = channel.id;
                newSubscription.xmlurl = req.body.url;
                newSubscription.updated = channel.updated;
                newSubscription.type = 'atom';
                newSubscription.save(function() {
                  addItemsToSubscription(newSubscription, queryResults);
                  callback(null, '');
                });
              } else {
                callback(null);
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
    }
  ], function(error, results) {
    if(error) {
      console.log(error);
    }
    res.redirect('/list-feeds');
  });
}

exports.delete = function(req, res) {
  user.findBy({ email: req.session.passport.user._json.email }, function(currentUser) {
    feed.remove( { user: currentUser._id, xmlurl: req.body.subscription });
  });
  res.send('');
}

exports.rename = function(req, res) {
  var userEmail = req.session.passport.user._json.email
    , currentUser
    , body = req.body
    , xmlUrl = body.xmlurl
    , newTitle = body.title;

  async.series([
    function(callback) {
      user.findBy({ email: userEmail }, function(cUser) {
        currentUser = cUser;
        callback(null);
      });
    },
    function(callback) {
      feed.findBy({ user: currentUser._id, xmlurl: xmlUrl }, function(subscription) {
        if(subscription) {
          subscription.title = newTitle;
          subscription.save(function() { callback(null); })
        } else {
          callback(null);
        }
      });
    }
  ],
    function(error){
      res.send('');
  })
}

exports.moveToFolder = function(req, res) {
  var body = req.body
    , xmlUrl = body.subscription
    , toFolder = body.folder
    , userEmail = req.session.passport.user._json.email
    , currentUser;

  async.series([
    function(callback) {
      user.findBy({email: userEmail}, function(cUser) {
        currentUser = cUser;
        callback(null);
      });
    },
    function(callback) {

      feed.findBy({xmlurl: xmlUrl, user: currentUser._id}, function(subscription) {
        if(subscription) {
          subscription.folder = toFolder;
          subscription.save(function() {
            callback(null);
          })
        }
      });

      callback(null);
    }
  ], function(error, results) {
    if(error) {
      console.log(error);
    }
    res.send('');
  });
}

function convertToSimpleSubscription(subscription) {
  return {
    title: subscription.title,
    xmlurl: subscription.xmlurl,
    htmlurl: subscription.htmlurl,
    items: subscription.items,
    itemsCount: subscription.items.length
  }
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
          newFeedItem.content = item.encoded || item.description;
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
          if(typeof(item.title.content) === 'string') {
            newFeedItem.title = item.title.content;
          } else {
            newFeedItem.title = item.title;
          }
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