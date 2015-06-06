//Import/require modules needed to crawl the schoolmaster schedules.
var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

//Define schooltypes that need to be ripped.
var scheduletypes = [
  'Klasrooster',
  'Docentrooster',
  'Leerlingrooster',
  'Lokaalrooster'
];
var schoolid;

//Function for getting pages with http requests.
function get(callback) {
  var index = [];
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
              http.get('http://' + res.req.socket._host + res.req.path + '&afdeling=' + studentcategory, function (res) {
                var _download = '';

                res.on('data', function (data) {
                  _download += iconv.decode(data, 'binary');
                });

                res.on('end', function () {
                  var list = cheerio('select', _download).children();

                  for (student in list) {
                    if (!isNaN(student)) {
                      var name = cheerio(list[student]).text().split(' - ')[1];
                      var id = cheerio(list[student]).val();

                      var database_entry = {
                        'id' : id,
                        'full_name' : name,
                        'first_name' : name.split(' ')[0],
                        'last_name' : name.split(' ').splice(1).join(' '),
                        'type' : scheduletype
                      }

                      index.push(database_entry);
                    }
                  }
                });
              });
            }
            callback(index);
          }
          else {
            for (entry of list) {
              var database_entry = {
                'name' : entry,
                'type' : scheduletype
              }
              index.push(database_entry);
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
  var times = 0;
  get(function (data) {
    console.log(data);
  });
}

crawl(934);
