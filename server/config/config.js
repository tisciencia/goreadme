module.exports = {
  root: require('path').normalize(__dirname + '/..'),
  app: {
    name: 'go-read me'
  },
  port: process.env.PORT || 3000,
  db: process.env.MONGO_URL || 'mongodb://localhost/goreadme'
};
