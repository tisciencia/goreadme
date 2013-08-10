var googleLocalConfig
  , googleLocalClientId
  , googleLocalClientSecret
  , googleLocalCallback;

if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK) {

  googleLocalConfig = require('./google-settings-local.js');
  googleLocalClientId = googleLocalConfig.GOOGLE_CLIENT_ID;
  googleLocalClientSecret = googleLocalConfig.GOOGLE_CLIENT_SECRET;
  googleLocalCallback = googleLocalConfig.GOOGLE_CALLBACK;

}

exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || googleLocalClientId;
exports.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || googleLocalClientSecret;
exports.GOOGLE_CALLBACK = process.env.GOOGLE_CALLBACK || googleLocalCallback;