var feed = function() {
  var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

  var _feedSchema = new Schema({

  });

  var _model = mongoose.model('Feed', _feedSchema);

}();

module.exports = feed;
