exports.index = function(req, res){
  res.render('index.html', {user: req.user, admin: false});
};
