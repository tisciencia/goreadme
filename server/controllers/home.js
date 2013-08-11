var statistics = require('../config/statistics')

exports.index = function(req, res){
  res.render('index.html', {
    user: req.user,
    admin: false,
    googleAnalyticsId: statistics.GOOGLE_ANALYTICS_ID,
    googleAnalyticsHost: statistics.GOOGLE_ANALYTICS_HOST
  });
};
