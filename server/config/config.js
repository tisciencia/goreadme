module.exports = {
  root: require('path').normalize(__dirname + '/..'),
  app: {
    name: 'go reader'
  },
  port: process.env.PORT || 3000,
  db: process.env.MONGO_URL || 'mongodb://localhost/goreader'
};
