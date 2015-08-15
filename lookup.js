//lookup.js

//Getting local variables via the configuration file.
var config = require('./configuration');
var schoolID = config().schoolID;

//Getting first and third party modules
var fs = require('fs');
var database = require('./database')();

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

function easter(search) {
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
