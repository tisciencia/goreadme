var feedItem = function() {
  var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = require('mongoose').Types.ObjectId;

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

  var _findOneBy = function(model, success, fail) {
    if(model._id && typeof(model._id) === 'string') {
      model._id = new ObjectId(model._id);
    }
    _model.findOne(model, function(error, item) {
      if(error) {
        fail(error);
      } else {
        success(item);
      }
    });
  };

  return {
    Model: _model,
    findOneBy: _findOneBy
  }
}();

module.exports = feedItem;
