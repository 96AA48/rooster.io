//lookup.js

//Importing first-party modules.
var fs = require('fs');

//Importing self-written modules.
var config = require('./configuration');
var database = require('./database')();

//Getting local variables from the configuration file.
var schoolID = config().schoolID;

/**
 * Function for doing a lookup in the database containing all records
 * of students, teachers and classrooms.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 * @param {Function} next - Next function supplied by Express.
 * @param {String} search - The search query given by the user.
 */
function get(req, res, next, search) {
  var index = database.collection('index');
  easter(search) ? req.easter = easter(search) : null;
  easter(search) ? search = easter(search).name : null;
  search = new RegExp(search, 'i');

  if (!config().localDatabase) {
    index.find({$or : [{id : search}, {name : search}, {first_name : search}, {last_name : search}, {username: search}]}).toArray(function (err, databaseEntry) {
      if (err) console.warn(err);
      handle(req, res, next, databaseEntry);
    });
  }
  else {
    index.find({$or : [{id : search}, {name : search}, {first_name : search}, {last_name : search}, {username: search}]}, function (err, databaseEntry) {
      if (err) console.warn(err);
      handle(req, res, next, databaseEntry);
    });
  }
}

/**
 * Function for handling a lookup request after it has(n't) found matches.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 * @param {Function} next - Next function supplied by Express.
 * @param {Array} databaseEntry - The search query given by the user.
 */
function handle(req, res, next, databaseEntry) {
  if ((req.easter || {}).type == 'RIP') {
      require('./auth').is(req, res, function () {
        res.render('schedule', req);
      });
  }
  else if (databaseEntry.length == 1) {
    databaseEntry[0].url = makeUrl(req, databaseEntry[0]);
    req.match = databaseEntry[0];
    next();
  }
  else if (databaseEntry.length == 0) {
    require('./auth').is(req, res, function () {
      res.render('not_found', req);
    });
  }
  else {
    req.match = databaseEntry;
    require('./auth').is(req, res, function () {
      res.render('list', req);
    });
  }
}

/**
 * Function for doing a lookup via the API.
 * @param {Object} req - Request object supplied by Express.s.
 * @param {Function} callback - Callback function needed to return the API call.
 */
function api(req, callback) {
  var index = database.collection('index');
  var query = RegExp(req.query.name, 'i');

  index.find({$or : [{id : query}, {name : query}, {first_name : query}, {last_name : query}, {username: query}, {group: query}]}).toArray(function (err, databaseEntry) {
    if (err) callback({'error': err});
    else {
      for (entry of databaseEntry) {entry.url = makeUrl(req, entry)}
      callback({'data': databaseEntry});
    }
  });
}

/**
 * Function for listing all of the students in a group.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 * @param {Function} next - Next function supplied by Express.
 * @param {String} list - The search (group) query given by the user.
 */
function list(req, res, next, list) {
  var index = database.collection('index');
  var query = RegExp(list, 'i');

  index.find({group: list}).toArray(function (err, databaseEntry) {
    if (err) {req.error = err; next();}
    else {
      if (databaseEntry.length < 1) require('./auth').is(req, res, function () {
        res.render('not_found', req);
      });
      req.match = databaseEntry;
      next();
    }
  });
}

/**
 * Function for making an url based on the found database match.
 * @param {Object} req - Request object supplied by Express.
 * @param {Array} databaseEntry - The database object used to create the url.
 * @return {String} url - The url that was created.
 */
function makeUrl(req, databaseEntry) {
  var url = 'http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + schoolID + '&type=' + databaseEntry.type.charAt(0).toUpperCase() + databaseEntry.type.slice(1) + 'rooster';

  switch (databaseEntry.type) {
    case 'leerling' :
      url += '&afdeling=' + databaseEntry.studentcategory + '&leerling=' + databaseEntry.id;
    break;

    case 'docent' :
      url += '&docenten=' + databaseEntry.name;
    break;

    case 'lokaal' :
      url += '&lokalen=' + databaseEntry.name;
    break;

    case 'klas' :
      url += '&klassen=' + databaseEntry.name;
    break;
  }

  if (req.query.tab) url += '&tabblad=' + req.query.tab

  return url;
}

/**
 * Function for checking if the requested search query has an easteregg.
 * @param {String} search - The user supplied search query.
 */
function easter(search) {
  var list = JSON.parse(fs.readFileSync(__dirname + '/eastereggs.json'));

  for (entry of list) {
    if (entry.easter == search.toLowerCase()) return entry;
  }

  return null;
}

//Export the functions as a module.
module.exports = {
  'get': get,
  'api': api,
  'list': list
};

//Testing function, if test is passed in the command line will execute a test.
if (process.argv[2] == "test") {
  console.log(easter('lord of the memeries'));
}
