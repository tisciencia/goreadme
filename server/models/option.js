'use strict';

var option = (function() {
    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var _optionSchema = new Schema({
        userOptions: String,
        user: [ { type: Schema.ObjectId, ref: 'User' } ]
    });

    var _model = mongoose.model('UserOption', _optionSchema);

    var _findBy = function(model, success, fail) {
        _model.findOne(model, function(error, options) {
            if(error) {
                fail(error);
            } else {
                success(options);
            }
        });
    };

    var _save = function(model, success, fail) {
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
    };

    return {
        Model: _model,
        save: _save,
        findBy: _findBy
    };
})();

module.exports = option;