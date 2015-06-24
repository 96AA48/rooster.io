var http = require('socsk5-http-client');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var mongodb = require('mongodb').MongoClient;
var config = require('./configuration');
var url = require('url');

var scheduletypes = [
  'Klasrooster',
  'Docentrooster',
  'Leerlingrooster',
  'Lokaalrooster'
];
var school_id;
var database;

//Function for getting pages with http requests.
function get() {
  database.collection('index').drop();

  for (scheduletype of scheduletypes) {

    (function (scheduletype) {

      var options = url.parse('http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + school_id + '&type=' + scheduletype);
      options.socksPort = config().tor_port;

      http.get(options, function (res) {

        var _download = {};
        _download.type = scheduletype;

        res.on('data', function (data) {
          _download.data += data;
        });

        res.on('end', function () {
          rip(_download);
        });

      });
    })(scheduletype);
  }
}

//Function for extracting the lists with useful information from the crawled pages.
//(e.g Student names/ids, Teacher codes, Chamber numbers)
function extract(page) {
	var array = cheerio('select', page).text().split('\n');
	return array.splice(1, array.length - 2);
}

//Function for ripping all of the information
function rip(data) {
  var list = extract(data.data);
  var collection = database.collection('index');

  if (data.type == 'Leerlingrooster') {

    for(studentcategory of list) {

      (function (studentcategory) {
        var options = url.parse('http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + school_id + '&type=' + data.type + '&afdeling=' + studentcategory);
        options.socksPort = config().tor_port;

        http.get(options, function (res) {
          var _download = '';

          res.on('data', function (data) {
            _download += iconv.decode(data, 'binary');
          });

          res.on('end', function () {
            var list_students = cheerio('select', _download).children();

            for (student in list_students) {

              if (!isNaN(student)) {
                var name = cheerio(list_students[student]).text().split(' - ')[1];
                var id = cheerio(list_students[student]).val();

                var database_entry = {
                  'id' : id,
                  'username' : id + name.split(' ')[0].toLowerCase(),
                  'name' : name,
                  'first_name' : name.split(' ')[0],
                  'last_name' : name.split(' ').splice(1).join(' '),
                  'studentcategory' : studentcategory,
                  'type' : data.type.replace(/rooster/g, '').toLowerCase()
                }

                collection.insert(database_entry, show_output);

                if (studentcategory == list[list.length - 1] && student == list_students.length - 1) {
                  setTimeout(function () {
                    database.close();
                  }, config().spider_timeout);
                }

              }
            }
          });
        });
      })(studentcategory);
    }
  }
  else {
    for (entry of list) {
      var database_entry = {
        'name' : entry,
        'type' : data.type.replace(/rooster/g, '').toLowerCase()
      }

      collection.insert(database_entry, show_output);
    }
  }
}

//Function being called to access functionality from this module.
function crawl() {
  school_id = config().school_id;
  mongodb.connect('mongodb://' + config().database, function (error, db) {
    if (error) console.warn(error);
    database = db;

    get();
  });
}


//Redundant function for draining native-mongodb-driver output
function show_output(error, message) {
  if (process.argv[3] == '-v') {
    // if (error) process.stdout.write(error.toString());
    if (message != null) console.log(message);
  }
}

module.exports = {
  'crawl' : crawl
}

if (process.argv[2] == 'test') {
  module.exports.crawl(934);
}
