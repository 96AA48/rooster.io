//database.js
var config = require('./configuration');
var fs = require('fs');

module.exports = function () {
  if (!config().localDatabase) return require('mongoskin').db('mongodb://' + config().database);
  else {
    var databases = {
      index: new (require('nedb'))({ filename: __dirname + '/resources/databases/index.db', autoload: true})
    };

    return {
      'collection': function (collection) {
          var database = databases[collection];

          database.drop = function () {
            fs.writeFileSync(database.filename, '');
          }

          return database;
       },
       'close': function () {
         return;
       }
    }
  }
}
