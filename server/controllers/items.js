var feedItem = require('../models/feedItem');

exports.markAsRead = function(req, res) {
  var  stories = JSON.parse(req.body.stories);
  if(stories && stories.length > 0) {
    stories.forEach(_markStoryAsRead);
  }
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