//lookup.js

//Getting local variables via the configuration file.
var config = require('./configuration');
var school_id = config().school_id;

//Getting first and third party modules
var fs = require('fs');
var database = require('mongoskin').db('mongodb://' + config().database);

function get(req, res, next, search) {
  var index = database.collection('index');
  easter(search) ? req.easter = easter(search) : null;
  easter(search) ? search = easter(search).name : null;
  search = new RegExp(search, 'i');

  index.find({$or : [{id : search}, {name : search}, {first_name : search}, {last_name : search}, {username: search}]}).toArray(function (err, database_entry) {
    if (err) console.warn(err);

    if (req.easter.type == 'RIP') {
        require('./auth').is(req, res, function () {
          res.render('schedule', req);
        });
    }
    else if (database_entry.length == 1) {
      database_entry[0].url = make_url(req, database_entry[0]);
      req.match = database_entry[0];
      next();
    }
    else if (database_entry.length == 0) {
      require('./auth').is(req, res, function () {
        res.render('not_found', req);
      });
    }
    else {
      req.match = database_entry;
      require('./auth').is(req, res, function () {
        res.render('list', req);
      });
    }
  });
}

function api(req, callback) {
  var index = database.collection('index');
  var query = RegExp(req.query.name, 'i');

  index.find({$or : [{id : query}, {name : query}, {first_name : query}, {last_name : query}, {username: query}, {group: query}]}).toArray(function (err, database_entry) {
    if (err) callback({'error': err});
    else {
      for (entry of database_entry) {entry.url = make_url(req, entry)}
      callback({'data': database_entry});
    }
  });
}

function list(req, res, next, list) {
  var index = database.collection('index');
  var query = RegExp(list, 'i');

  index.find({group: list}).toArray(function (err, database_entry) {
    if (err) {req.error = err; next();}
    else {
      if (database_entry.length < 1) require('./auth').is(req, res, function () {
        res.render('not_found', req);
      });
      req.match = database_entry;
      next();
    }
  });
}

function make_url(req, database_entry) {
  var url = 'http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + school_id + '&type=' + database_entry.type.charAt(0).toUpperCase() + database_entry.type.slice(1) + 'rooster';

  switch (database_entry.type) {
    case 'leerling' :
      url += '&afdeling=' + database_entry.studentcategory + '&leerling=' + database_entry.id;
    break;

    case 'docent' :
      url += '&docenten=' + database_entry.name;
    break;

    case 'lokaal' :
      url += '&lokalen=' + database_entry.name;
    break;

    case 'klas' :
      url += '&klassen=' + database_entry.name;
    break;
  }

  if (req.query.tab) url += '&tabblad=' + req.query.tab

  return url;
}

function easter(search) {
  console.log('search', search);
  var list = JSON.parse(fs.readFileSync(__dirname + '/eastereggs.json'));

  for (entry of list) {
    if (entry.easter == search.toLowerCase()) return entry;
  }

  return null;
}

module.exports = {'get': get, 'api': api, 'list': list};

//Testing function, if test is passed in the command line will execute a test.
if (process.argv[2] == "test") {
  console.log(easter('aardappel'));
}
