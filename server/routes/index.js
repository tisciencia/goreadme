var fs = require('fs')
  , unzip = require('unzip');

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

exports.importOmpl = function(req, res) {

  if(req.files) {
    fs.createReadStream(req.files.file.path)
      .pipe(unzip.Parse())
      .on('entry', function (entry) {
        var fileName = entry.path;
        console.log(fileName);
//        var type = entry.type; // 'Directory' or 'File'
//        var size = entry.size;
//        if (fileName === "this IS the file I'm looking for") {
//          entry.pipe(fs.createWriteStream('output/path'));
//        } else {
//          entry.autodrain();
//        }
      });
  }

//  var newPath = __dirname + "/uploads/" + req.files.file.name;
//  fs.rename(req.files.file.path, newPath, function(error) {
//    console.log(error);
//  });

  res.send('');
};