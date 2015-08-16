//spider.js

//Import first-party modules.
var url = require('url');

//Import third-party modules
var http = require('socks5-http-client');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

//Import self-written modules.
var config = require('./configuration');
var database = require('./database')();

//Define local variables.
var scheduletypes = [
  'Klasrooster',
  'Docentrooster',
  'Leerlingrooster',
  'Lokaalrooster'
];
var schoolID = config().schoolID;

/**
 * Function for crawling the schedule site for data such as: students, teachers
 * chambers and groups.
 */
function crawl() {
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

/**
 * Function for extracting the lists with useful information from the crawled pages.
 * (e.g Student names/ids, Teacher codes, Chamber numbers)
 * @param {String} page - A string containing a downloaded schedule page.
 */
function extract(page) {
	var array = cheerio('select', page).text().split('\n');
	return array.splice(1, array.length - 2);
}

/**
 * Function for ripping all possible information from a page.
 * @param {String} page - A string containing a downloaded schedule page.
 */
function rip(page) {
  var list = extract(page.data);
  var collection = database.collection('index');

  if (page.type == 'Leerlingrooster') {

    for(studentcategory of list) {

      (function (studentcategory) {
        var options = url.parse('http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + schoolID + '&type=' + page.type + '&afdeling=' + studentcategory);
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
                  'type' : page.type.replace(/rooster/g, '').toLowerCase()
                }

                collection.insert(databaseEntry);

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
        'type' : page.type.replace(/rooster/g, '').toLowerCase()
      }

      collection.insert(databaseEntry);
    }
  }
}

//Exporting functions as a module.
module.exports = {
  'crawl' : crawl
}

//Testing/ripping command to be used from cli.
if (process.argv[2] == 'test' || process.argv[2] == 'rip') {
  module.exports.crawl(934);
}
