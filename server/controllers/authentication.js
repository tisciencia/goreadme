'use strict';

var user = require('../models/user')
  , _ = require('underscore');

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
};

exports.googleCallback = function(req, res) {
  var loggedUser = {};
  _.extend(loggedUser, req.user._json);

  user.findBy({email: loggedUser.email}, function(userFound) {
    if(!userFound) {
      var newUser = new user.Model();
      _.extend(newUser, loggedUser);
      user.create(newUser);
    }
  });

  res.redirect('/');
}

exports.verifyUserAuthenticated = function(req, res, next) {
  if(!req.session.passport.user) {
    res.redirect('/');
  } else {
    next();
  }
}