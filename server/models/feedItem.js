var feedItem = function() {
  var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

  var _feedItemSchema = new Schema({
    link: String,
    title: String,
    description: String,
    content: String,
    publishedDate: { type: Date },
    read: Boolean,
    starred: Boolean,
    author: String
  });

  var _model = mongoose.model('FeedItem', _feedItemSchema);

  return {
    Model: _model
  }
}();

module.exports = feedItem;
