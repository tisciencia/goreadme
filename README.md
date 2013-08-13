go-read me
========

A feed reader built with [Node.js](http://nodejs.org/), [Angular.js](http://angularjs.org/) and [mongoDB](http://www.mongodb.org/)

How to setup a developer environment
-------

1. Install Node.js
2. Install mongoDB
3. Install bower with the command: npm install -g bower
3. Fork/clone this repo
4. From the directory run npm install && bower install
5. To use Google oAuth create a new project using the [Google APIs Console](https://code.google.com/apis/console/)
6. Create a copy of the file server/config/google-settings.js.rename called server/config/google-settings-local.js and edit this file with your key and secret from Google APIs
7. Run node app.js
