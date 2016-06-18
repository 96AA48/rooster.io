//spider.js
/**
 * Module/script for getting students, teachers, chambers and groups from the schedule website.
 * This script needs to be run before using the application, as the website will have no information to run on.
 * @module spider
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Import first-party modules.
const url = require('url');

//Import third-party modules
const http = require('socks5-http-client');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

//Import self-written modules.
const config = require('./configuration');
const database = require('./database')();

//Define local variables.
const schoolID = config().schoolID;

var scheduletypes = [
  'Klasrooster',
  'Docentrooster',
  'Leerlingrooster',
  'Lokaalrooster'
];

/**
 * Function for crawling the schedule site for data such as: students, teachers
 * chambers and groups.
 */
function crawl() {
  console.log('Starting to crawl the schedule pages for names, student IDs, chambers and teachers');
  database.collection('index').drop();

  for (scheduletype of scheduletypes) {

    (function (scheduletype) {

      let options = url.parse('http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + schoolID + '&type=' + scheduletype);
      options.socksPort = config().torPort;
      options.socksHost = config().torHost;

      http.get(options, (res) => {
        let _download = {};
        _download.type = scheduletype;

        res.on('data', (data) => _download.data += data);
        res.on('end', () => rip(_download));
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
	let array = cheerio('select', page).text().split('\n');
	return array.splice(1, array.length - 2);
}

/**
 * Function for ripping all possible information from a page.
 * @param {String} page - A string containing a downloaded schedule page.
 */
function rip(page) {
  let list = extract(page.data);
  let collection = database.collection('index');

  if (page.type == 'Leerlingrooster') {
    console.log('\nRipping a studentlist')
    for(studentcategory of list) {

      (function (studentcategory) {
        let options = url.parse('http://roosters5.gepro-osi.nl/roosters/rooster.php?school=' + schoolID + '&type=' + page.type + '&afdeling=' + studentcategory);
        options.socksPort = config().torPort;
        options.socksHost = config().torHost;

        http.get(options, (res) => {
          let _download = '';

          res.on('data', (data) => _download += iconv.decode(data, 'binary'));

          res.on('end', () => {
            let listOfStudents = cheerio('select', _download).children();

            for (student in listOfStudents) {

              if (!isNaN(student)) {
                let name = cheerio(listOfStudents[student]).text().split(' - ')[1];
                let group = cheerio(listOfStudents[student]).text().split(' - ')[0];
                let id = cheerio(listOfStudents[student]).val();

                let databaseEntry = {
                  'id' : id,
                  'group' : group,
                  'username' : id + name.split(' ')[0].toLowerCase(),
                  'name' : name,
                  'first_name' : name.split(' ')[0],
                  'last_name' : name.split(' ').splice(1).join(' '),
                  'studentcategory' : studentcategory,
                  'type' : page.type.replace(/rooster/g, '').toLowerCase()
                }
                process.stdout.write('☐');
                collection.insert(databaseEntry);

                if (studentcategory == list[list.length - 1] && student == listOfStudents.length - 1) {
                  setTimeout(() => database.close(), config().spiderTimeout);
                }
              }
            }
          });
        });
      })(studentcategory);
    }
  }
  else {
    console.log('\nRipping a', page.type);
    for (entry of list) {
      let databaseEntry = {
        'name' : entry,
        'type' : page.type.replace(/rooster/g, '').toLowerCase()
      }
      process.stdout.write('☐');
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
  module.exports.crawl(config().schoolID);
}
