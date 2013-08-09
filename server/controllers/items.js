var feedItem = require('../models/feedItem');

exports.markAsRead = function(req, res) {

  var  stories = JSON.parse(req.body.stories);

  feedItem.findOneBy({"_id": stories[0].Story}, function(itemFound) {
    if(itemFound) {
      itemFound.read = true;
      itemFound.save();
    }
    res.send('');
  });

}