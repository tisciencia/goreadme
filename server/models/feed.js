var feed = function() {
  var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , async = require('async');

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

  var _findAllBy = function() {
    var model = arguments[0]
      , populate = ''
      , success
      , fail;

    if(typeof(arguments[1]) === 'string') {
      populate = arguments[1];
      success = arguments[2];
      fail = arguments[3];
    } else {
      success = arguments[1];
      fail = arguments[2];
    }

    _model.find(model)
      .populate(populate)
      .exec(function(error, feeds) {
      if(error) {
        fail(error);
      } else {
        success(feeds);
      }
    });
  }

  var _findBy = function() {
    var model = arguments[0]
      , populate
      , success
      , fail;

    if(typeof(arguments[1]) === 'object') {
      populate = arguments[1];
      success = arguments[2];
      fail = arguments[3];
    } else {
      success = arguments[1];
      fail = arguments[2];
    }

    if(populate) {
      _model.findOne(model)
        .populate(populate)
        .exec(function(error, feed) {
          if(error) {
            fail(error);
          } else {
            success(feed);
          }
        });
    } else {
      _model.findOne(model)
        .exec(function(error, feed) {
          if(error) {
            fail(error);
          } else {
            success(feed);
          }
        });
    }
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
    _findBy(model, {path: 'items'}, function(subscription) {
      if(subscription) {
        async.each(subscription.items,
          function(i, cb){
            i.remove();
            cb();
          },
          function(){
            subscription.remove(function(error) {
              if(error && fail && typeof(fail) === 'function') {
                fail();
              } else {
                if(success && typeof(success) === 'function') {
                  success();
                }
              }
            })
        });
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
