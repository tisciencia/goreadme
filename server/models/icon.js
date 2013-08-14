var option = function() {
  var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

  var _iconSchema = new Schema({
    htmlUrl: String,
    iconUrl: String
  });

  var _model = mongoose.model('Icon', _iconSchema);

  var _findAllBy = function(urls, success, fail) {
    var query = _model.find().where('htmlUrl').in(urls);
    query.exec(function(error, icons) {
      if(error && typeof(fail) === 'string') {
        fail(error);
      } else {
        if(typeof(success) === 'function') {
          success(icons);
        }
      }
    });
  }

  var _findBy = function(model, success, fail) {
    _model.findOne(model, function(error, icon) {
      if(error) {
        fail(error);
      } else {
        success(icon);
      }
    });
  };

  var _save = function(model, success, fail) {
    model.save(function(error, icon) {
      if(error) {
        if(typeof fail === 'function') {
          fail(error);
        }
      } else {
        if(typeof success === 'function') {
          success(icon);
        }
      }
    });
  };

  return {
    Model: _model,
    save: _save,
    findBy: _findBy,
    findAllBy: _findAllBy
  }
}();

module.exports = option;
