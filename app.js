var express = require('express')
  , config = require('./server/config/config');

var app = express();

require('./server/config/express')(app, config);
require('./server/config/routes')(app);
require('./server/config/passport-config');

app.listen(config.port, function() {
  console.log('Server now listening on port' + config.port);
});