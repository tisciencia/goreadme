var express = require('express')
  , config = require('./config/config');

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);
require('./config/passport-config');

// app.listen(config.port, function() {
//   console.log('Server now listening on port' + config.port);
// });

module.exports = app;