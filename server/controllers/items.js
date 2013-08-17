'use strict';

var feedItem = require('../models/feedItem'),
    feed = require('../models/feed'),
    user = require('../models/user'),
    async = require('async');

function _markStoryAsRead(story) {
    feedItem.findOneBy({ '_id' : story.Story}, function(itemFound) {
        if(itemFound) {
            itemFound.read = true;
            itemFound.save();
        }
    });
}

function updateFieldForItem(itemId, field, value, cb) {
    feedItem.findOneBy({ _id: itemId }, function(itemFound) {
        if(itemFound) {
            itemFound[field] = value;
            itemFound.save();
        }
        if (cb && typeof(cb) === 'function') {
            cb();
        }
    });
}

exports.markAsRead = function(req, res) {
    var  stories = JSON.parse(req.body.stories);
    if(stories && stories.length > 0) {
        stories.forEach(_markStoryAsRead);
    }
    res.send(200);
};

exports.markAsUnread = function(req, res) {
    var body = req.body;
    updateFieldForItem(body.storyId, 'read', !body.unread);
    res.send(200);
};

exports.markStarred = function(req, res) {
    var body = req.body;
    updateFieldForItem(body.storyId, 'starred', body.starred);
    res.send(200);
};

exports.listItemsFromFeed = function(req, res) {
    var userEmail = req.session.passport.user._json.email,
        currentUser,
        xmlUrl = req.params.feedUrl;

    async.series([
        function(callback) {
            user.findBy({ email: userEmail }, function(cUser) {
                currentUser = cUser;
                callback();
            });
        },
        function(callback) {
            feed.findBy({ user: currentUser._id, xmlurl: xmlUrl },
                {path: 'items', select: 'xmlurl starred title publishedDate _id read link'},
                function(subscription) {
                    if(subscription) {
                        callback(null, subscription.items);
                    } else {
                        callback();
                    }
                });
        }
    ],
        function(error,results) {
            if(error) {
                console.log(error);
            }
            res.json(results[1]);
        });
};

exports.getContents = function(req, res) {
    var storyToFech = req.body;

    feedItem.findOneBy({ _id: storyToFech.story }, function(story) {
        if(story) {
            res.json(story);
        } else {
            res.send(200);
        }
    });
};