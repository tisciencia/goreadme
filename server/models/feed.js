var feed = function() {
  var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

  var _feedSchema = new Schema({
    title: String,
    xmlurl: String,
    htmlurl: String,
    description: String,
    type: String,
    language: String,
    version: String,
    folder: String,
    user: [ { type: Schema.ObjectId, ref: 'User' } ],
    items: [ { type: Schema.ObjectId, ref: 'FeedItem' } ]
  });

  var _model = mongoose.model('Feed', _feedSchema);

  var _findAllBy = function(model, success, fail) {
    _model.find(model)
      .populate('items')
      .exec(function(error, feeds) {
      if(error) {
        fail(error);
      } else {
        success(feeds);
      }
    });
  }

  var _findBy = function(model, success, fail) {
    _model.findOne(model, function(error, feed) {
      if(error) {
        fail(error);
      } else {
        success(feed);
      }
    });
  };

  var _create = function(model, success, fail) {

    _findBy({xmlurl: model.xmlurl}, function(feed) {
      if (!feed) {
        model.save(function(error, feed) {
          if(error) {
            if(typeof fail === 'function') {
              fail(error);
            }
          } else {
            if(typeof success === 'function') {
              success(feed);
            }
          }
        });
      }
    });
  };

  var _remove = function(model, success, fail) {
    _findBy(model, function(subscription) {
      if(subscription) {
        subscription.remove(function(error) {
          if(error && fail && typeof(fail) === 'funciton') {
            fail();
          } else {
            if(success && typeof(success) === 'function') {
              success();
            }
          }
        })
      }
    })
  }

  return {
    Model: _model,
    create: _create,
    findBy: _findBy,
    remove: _remove,
    findAllBy: _findAllBy
  }
}();

module.exports = feed;
