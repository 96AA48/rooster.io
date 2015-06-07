//Import/require modules needed to crawl the schoolmaster schedules.
var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var mongodb = require('mongodb').MongoClient;

//Define schooltypes that need to be ripped.
var scheduletypes = [
  'Klasrooster',
  'Docentrooster',
  'Leerlingrooster',
  'Lokaalrooster'
];
var schoolid;

//Function for getting pages with http requests.
function get(database) {

  var collection = database.collection('index');
  collection.drop();

  //Go past all of the scheduletypes and download their pages.
  for (scheduletype of scheduletypes) {
    (function (scheduletype) {
      var link = 'http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + schoolid + '&type=' + scheduletype;

      scheduletype = scheduletype.replace(/rooster/g, '').toLowerCase();

      http.get(link, function (res) {
        var _download = '';

        res.on('data', function (data) {
          _download += data;
        });

        res.on('end', function () {
          var list = extract(_download);

          if (scheduletype == 'leerling') {
            for(studentcategory of list) {
              (function (studentcategory) {

                http.get('http://' + res.req.socket._host + res.req.path + '&afdeling=' + studentcategory, function (res) {
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
                          'full_name' : name,
                          'first_name' : name.split(' ')[0],
                          'last_name' : name.split(' ').splice(1).join(' '),
                          'studentcategory' : studentcategory,
                          'type' : scheduletype
                        }


                        collection.insert(database_entry, showOutput);
                        if (studentcategory == list[list.length - 1] && student == list_students.length - 1) {
                          database.close();
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
                'type' : scheduletype
              }
              collection.insert(database_entry, showOutput);
            }
          }

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

//Function being called to access functionality from this module.
function crawl(sid) {
  schoolid = sid;
  mongodb.connect('mongodb://wallpiece/roosterio', function (error, database) {
    if (error) console.warn(error);
    get(database);
  })
}

function showOutput(error, message) {
  if (process.argv[2] == '-v') {
    if (error) process.stdout.write(error.toString());
    process.stdout.write(message + '\n');
  }
}

crawl(934);
