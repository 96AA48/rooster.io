//schedule.js
/**
 * Module for parsing downloaded schedule pages into useable/readable JSON objects.
 * Usually used after a lookup with the supplied information from it.
 * @module schedule
 */

//Import first-party modules.
var url = require('url');

//Import third-party modules.
var http = require('socks5-http-client');
var cheerio = require('cheerio');

//Import self-written modules.
var config = require('./configuration');

/**
 * Function being called by Express when the user requests a schedule.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 * @param {Function} next - Next function supplied by Express.
 */
function get(req, res, next) {
  getSchedule(req.match.url, function (json) {
    req.match.json = json;
    next();
  });
}

/**
 * Function for getting the information off of the schedule servers.
 * @param {String} url - The url of the page that needs to be downloaded.
 * @param {Function} callback - Callback function to return the downloaded information.
 */
function getSchedule(url, callback) {
  var options = url.parse(url);
  options.socksPort = config().torPort;
  options.socksHost = config().torHost;

  http.get(options, function (res) {
    var _download = '';

    res.on('data', function (data) {
      _download += data;
    });

    res.on('end', function () {
      callback(toJSON(_download));
    });
  });
}

/**
 * Function for getting the names of the schedules with Regular Expressions
 * @param {String} page - The downloaded page with schedule information.
 * @return {Array} names - An array populated with the schedule names (basic, week)
 */
function scheduleNames(page) {
   var extract = cheerio('table tr td[valign="bottom"] table tr td b, table tr td[valign="bottom"] table tr td a', page).text().split(/\s\s/);
   var tab = 0;
   var names = [];

   for (element of extract) {
      element != '' ? names.push({
        'letter': element.substr(0, 1),
        'value' : element.match(/.*rooster|t\/m|\d\d\s\w{3}/gi).join(' ').slice(1).toLowerCase(),
        'tab': tab++
      }) : null;
   }

   return names;
}

/**
 * Function for converting the page (string) into a JSON datastructure.
 * @param {String} page - The downloaded page with schedule information.
 * @return {Object} scheduleData - The converted JSON datastructure.
 */
function toJSON(page) {
  var result = cheerio('td:nth-child(3) table', page);
  var names = scheduleNames(page);
  var isTeacher = cheerio(cheerio(page).find('tr.CoreDark').find('td')[3]).find('a').html() == null;
  var amountOfDays = cheerio(result).find('tr.AccentDark').find('td').length - 1;
  var amountOfHours = config().amountOfHours;

  var scheduleData = [];

  var offset = isTeacher ? 5 : 6;

  //Looping for amount of days
  for (day = 0; day < amountOfDays; day++) {
     scheduleData[day] = [];

    //Looping for amount of hours
    for (hour = 0; hour < amountOfHours; hour++) {
      var schedule = cheerio('tr:nth-child('+ (offset + hour) +')', result);

      //Looping for (optional) specialhours
      var specialHours = schedule.find('table').eq(day).children().length;
      scheduleData[day][hour] = {teacher: [], chamber: [], course: [], changed: []};
      for (subhour = 0; subhour < specialHours; subhour++) {
         var selectedHour = schedule.find('table').eq(day).find('tr').eq(subhour).find('td');
         //Give the value of the schedule hour to the fitting array.
         scheduleData[day][hour].teacher[subhour] = selectedHour.eq(0).text().replace(/\r|\n/g, '');
         scheduleData[day][hour].chamber[subhour] = selectedHour.eq(2).text();
         scheduleData[day][hour].course[subhour] = selectedHour.eq(4).text();
         //Check if the hour is 'changed' by the schedule authors, if so set to true.
         scheduleData[day][hour].changed[subhour] = selectedHour.eq(0).attr().class == 'tableCellNew' ? true : false;
      }
    }
  }

  scheduleData.names = names;

  return scheduleData;
}

/**
 * Function for doing a lookup in the database containing all records
 * of students, teachers and classrooms.
 * @param {Object} lookup - Object with all of the information from the request.
 * @param {Function} callback - Callback function for the API module.
 */
function api(lookup, callback) {
  getSchedule(lookup.data[0].url, callback);
}

//Exporting the schedule function.
module.exports = {
  'get': get,
  'api': api
};
