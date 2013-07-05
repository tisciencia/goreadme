exports.index = function(req, res){
  console.log(req.user);
  res.render('index.html', {user: req.user, admin: false});
};

exports.login = function(req, res){
  res.render('index');
};

exports.logout = function(req, res){
  res.render('index');
};