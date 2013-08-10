var feedItem = require('../models/feedItem');

exports.markAsRead = function(req, res) {
  var  stories = JSON.parse(req.body.stories);
  if(stories && stories.length > 0) {
    stories.forEach(_markStoryAsRead);
  }
  res.send('');
}

exports.markAsUnread = function(req, res) {
  var body = req.body;
  updateFieldForItem(body.storyId, "read", !body.unread);
  res.send('');
}

exports.markStarred = function(req, res) {
  var body = req.body;
  updateFieldForItem(body.storyId, "starred", body.starred);
  res.send('');
}

function _markStoryAsRead(story) {
  feedItem.findOneBy({"_id": story.Story}, function(itemFound) {
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
  })

}