var http = require('socks5-http-client');
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
var schoolID;
var database;

//Function for getting pages with http requests.
function get() {
  database.collection('index').drop();

  for (scheduletype of scheduletypes) {

    (function (scheduletype) {

      var options = url.parse('http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + schoolID + '&type=' + scheduletype);
      options.socksPort = config().torPort;
      options.socksHost = config().torHost;

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
        var options = url.parse('http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + schoolID + '&type=' + data.type + '&afdeling=' + studentcategory);
        options.socksPort = config().torPort;
        options.socksHost = config().torHost;

        http.get(options, function (res) {
          var _download = '';

          res.on('data', function (data) {
            _download += iconv.decode(data, 'binary');
          });

          res.on('end', function () {
            var listOfStudents = cheerio('select', _download).children();

            for (student in listOfStudents) {

              if (!isNaN(student)) {
                var name = cheerio(listOfStudents[student]).text().split(' - ')[1];
                var group = cheerio(listOfStudents[student]).text().split(' - ')[0];
                var id = cheerio(listOfStudents[student]).val();

                var databaseEntry = {
                  'id' : id,
                  'group' : group,
                  'username' : id + name.split(' ')[0].toLowerCase(),
                  'name' : name,
                  'first_name' : name.split(' ')[0],
                  'last_name' : name.split(' ').splice(1).join(' '),
                  'studentcategory' : studentcategory,
                  'type' : data.type.replace(/rooster/g, '').toLowerCase()
                }

                collection.insert(databaseEntry, showOutput);

                if (studentcategory == list[list.length - 1] && student == listOfStudents.length - 1) {
                  setTimeout(function () {
                    database.close();
                  }, config().spiderTimeout);
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
      var databaseEntry = {
        'name' : entry,
        'type' : data.type.replace(/rooster/g, '').toLowerCase()
      }

      collection.insert(databaseEntry, showOutput);
    }
  }
}

//Function being called to access functionality from this module.
function crawl() {
  schoolID = config().schoolID;
  mongodb.connect('mongodb://' + config().database, function (error, db) {
    if (error) console.warn(error);
    database = db;

    get();
  });
}


//Redundant function for draining native-mongodb-driver output
function showOutput(error, message) {
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
