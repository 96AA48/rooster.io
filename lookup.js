//lookup.js
var http = require('http');
var config = require('./configuration');

var database = require('mongoskin').db('mongodb://' + config().database);
var school_id = config().school_id;

//Function for looking through the database and finding entries related to the searchterm.
function lookup(req, res, next, search) {
  var index = database.collection('index');
  search = new RegExp(search, 'i'); //Make regular exeption for ignoring the case (Bram vs BRAM) should return the same.
  index.find({$or : [{id : search}, {name : search}, {first_name : search}, {last_name : search}]}).toArray(function (err, database_entry) {
    if (err) console.warn(err);

    if (database_entry.length == 1) {
      database_entry[0].url = make_url(req, database_entry[0]);
      req.match = database_entry[0];
      next();
    }
    else if (database_entry.length == 0) {
      res.send('No matches were found in the database.');
    }
    else {
      res.send('Multiple hits were found in the database.');
    }
  });
}

//Function for making a link out of the given database_entry.
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

module.exports = lookup;
