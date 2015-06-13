//schedule.js
var http = require('http');
var database = require('mongoskin').db('mongodb://wallpiece/roosterio');
var schoolid = 934;

function lookup(req, res, next, search) {
  console.log(search);
  var index = database.collection('index');
  index.find({$or : [{id : search}, {name : search}, {first_name : search}, {last_name : search}]}).toArray(function (err, database_entry) {
    if (err) console.warn(err);

    if (database_entry.length == 1) {
      get(make_link(database_entry[0]), function (schedule) {
        res.end(schedule);
      });
    }
    else if (database_entry.length == 0) {
      res.send('No matches were found in the database.');
    }
    else {
      res.send('Multiple hits were found in the database.');
    }
  });
}

function make_link(database_entry) {
  var link = 'http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + schoolid + '&type=' + database_entry.type.charAt(0).toUpperCase() + database_entry.type.slice(1) + 'rooster';

  switch (database_entry.type) {
    case 'leerling' :
      link += '&afdeling=' + database_entry.studentcategory + '&leerling=' + database_entry.id;
    break;

    case 'docent' :
      link += '&docenten=' + database_entry.name;
    break;

    case 'lokaal' :
      link += '&lokalen=' + database_entry.name;
    break;

    case 'klas' :
      link += '&klassen=' + database_entry.name;
    break;
  }

  return link;
}

function get(link, callback) {
  console.log(link);
}

module.exports = lookup;
