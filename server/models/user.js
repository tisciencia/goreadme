var user = function() {
  var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

  var _userSchema = new Schema({
    email: String,
    name: String,
    link: String,
    picture: String,
    locale: String,
    feeds: [ { type: Schema.ObjectId, ref: 'Feed' } ]
  });

  var _model = mongoose.model('User', _userSchema);

  var _findBy = function(model, success, fail) {
    _model.findOne(model, function(error, user) {
      if(error) {
        fail(error);
      } else {
        success(user);
      }
    });
  };

  var _create = function(model, success, fail) {
    model.save(function(error, user) {
      if(error) {
        if(typeof fail === 'function') {
          fail(error);
        }
      } else {
        if(typeof success === 'function') {
          success(user);
        }
      }
    });
  };

  return {
    Model: _model,
    create: _create,
    findBy: _findBy
  };
}();

module.exports = user;
