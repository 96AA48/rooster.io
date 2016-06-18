//database.js
/**
 *  Module for using a database interface
 * Either local (NeDB) or remote (MongoDB) based on configuration values.
 * @module database
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Import first-party modules.
const fs = require('fs');

//Import self-written modules.
const config = require('./configuration');

/**
 * Function for using a database interface.
 * Either local (NeDB) or remote (MongoDB).
 * @return {Object} database - Entire database engine (NeDB/MongoDB).
 */
module.exports = () => {
  if (!config().localDatabase) return require('mongoskin').db('mongodb://' + config().database);
  else {
    let databases = {
      index: new (require('nedb'))({ filename: __dirname + '/resources/databases/index.db', autoload: true})
    };

    return {
      'collection': (collection) => {
          let database = databases[collection];

          database.drop = () => {
            fs.writeFileSync(database.filename, '');
          }

          return database;
       },
       'close': () => {
         return;
       }
    }
  }
}
