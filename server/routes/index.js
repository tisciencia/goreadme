var fs = require('fs')
  , unzip = require('unzip')
  , OpmlParser = require('opmlparser');

exports.index = function(req, res){
  res.render('index.html', {user: req.user, admin: false});
};

exports.login = function(req, res){
  res.render('index');
};

exports.logout = function(req, res){
  res.render('index');
};

exports.importOmpl = function(req, res) {

  if(req.files) {
    fs.createReadStream(req.files.file.path)
      .pipe(unzip.Parse())
      .on('error', function(error) {
        console.log(error);
      })
      .on('entry', function (entry) {
        var fileName = entry.path;
        if(/subscriptions\.xml/.test(fileName)) {
          entry.pipe(new OpmlParser())
            .on('error', function(error) {
              console.log(error);
            })
            .on('feed', function(feed){
              //feeds.push(feed);
            })
            .on('end', function(){
              console.log('end import opml');
            });
        }
      });
  }
  res.send('');
};