var express = require('express')
  , http = require('http')
  , path = require('path')
  , passport = require('passport');

module.exports = function(app, config) {
  app.set('port', config.port);
  app.set('views', path.join(config.root, '/../app'));
  app.engine('html', require('ejs').renderFile);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({secret: 'my hard secret'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(config.root, '/../app')));

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }
};