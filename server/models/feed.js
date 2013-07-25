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
    user: [ { type: Schema.ObjectId, ref: 'User' } ]
  });

  var _model = mongoose.model('Feed', _feedSchema);

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

  return {
    Model: _model,
    create: _create,
    findBy: _findBy
  }
}();

module.exports = feed;
