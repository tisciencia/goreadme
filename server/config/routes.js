'use strict';

var passport = require('passport');

module.exports = function(app) {
  var home = require('../controllers/home')
    , authentication = require('../controllers/authentication')
    , feed = require('../controllers/feed')
    , feedImport = require('../controllers/import');

  app.get('/', home.index);
  app.get('/list-feeds', feed.listFeeds);
  app.post('/import-opml', feedImport.importOmpl);

  app.get('/login/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'] }),
      function(req, res){
  });

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login/google' }),
    function(req, res) {
      res.redirect('/');
    //var user = req.user._json;

//    var compute = new googleapis.auth.Compute();
//    var datasetId = '';
//
//    function googledatastore(cb) {
//      compute.authorize(function(err, result) {
//        console.log(err);
//        console.log(result);
//        console.log('xxx');
//        googleapis.discover('datastore', 'v1beta1')
//          .withAuthClient(compute)
//          .execute(function(err, client) {
//            cb(err, client.datastore.datasets);
//          });
//      });
//    }
//
//    console.log('yyy');
//
//    googledatastore(function(err, dataStore) {
//      console.log('aqui');
//      console.assert(!err, err);
//
//      dataStore.blindWrite({
//        datasetId: datasetId,
//        mutation: {
//          upsert: [{
//            key: user.email,
//            properties: {
//              name: { values: [{ stringValue: user.name }] },
//              email:  { values: [{ stringValue: user.email }] },
//              link:  { values: [{ stringValue: user.link }] },
//              picture:  { values: [{ stringValue: user.picture }] },
//              locale:  { values: [{ stringValue: user.locale }] }
//            }
//          }]
//        }
//      })
//      .execute(function(err, result) {
//          console.assert(!err, err);
//          console.log('funcionou');
//      });
//
//    });
  });
};