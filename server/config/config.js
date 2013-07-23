module.exports = {
  root: require('path').normalize(__dirname + '/..'),
  app: {
    name: 'go reader'
  },
  port: 3000,
  db: 'mongodb://localhost/goreader'
};
