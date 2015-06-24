//schedule.js
var http = require('socks5-http-client');
var cheerio = require('cheerio');
var config = require('./configuration');
var url = require('url');

//Wrapper function that is being called by express.
function schedule(req, res, next) {
  get(req.match.url, function (json) {
    req.match.json = json;
    next();
  });
}

//Function for getting the page via http.
function get(get_url, callback) {
  
  var options = url.parse(get_url);
  options.socksPort = config().tor_port;
  options.socksHost = config().tor_host;

  http.get(options, function (res) {
    var _download = '';

    res.on('data', function (data) {
      _download += data;
    });

    res.on('end', function () {
      callback(to_json(_download));
    });
  });
}

function schedule_types(page) {
   var extract = cheerio('table tr td[valign="bottom"] table tr td b, table tr td[valign="bottom"] table tr td a', page).text().split(/\s\s/);
   var tab = 0;
   var types = [];

   for (element of extract) {
         element != '' ? types.push({
           'letter': element.substr(0, 1),
           'value' : element.match(/.*rooster|t\/m|\d\d\s\w{3}/g).join(' ').slice(1),
           'tab': tab++
         }) : null;
   }

   return types;
}

//Function for converting the page into a json dataset.
function to_json(page) {
  var result = cheerio('td:nth-child(3) table', page);
  var types = schedule_types(page);
  var is_teacher = cheerio(cheerio(page).find('tr.CoreDark').find('td')[3]).find('a').html() == null;
  var amount_of_days = cheerio(result).find('tr.AccentDark').find('td').length - 1;
  var amount_of_hours = config().amount_of_hours;

  var schedule_data = [];

  var offset = is_teacher ? 5 : 6;

  //Looping for amount of days
  for (day = 0; day < amount_of_days; day++) {
     schedule_data[day] = [];

    //Looping for amount of hours
    for (hour = 0; hour < amount_of_hours; hour++) {
      var schedule = cheerio('tr:nth-child('+ (offset + hour) +')', result);

      //Looping for (optional) specialhours
      var amount_of_special_hours = schedule.find('table').eq(day).children().length;
      schedule_data[day][hour] = {teacher: [], chamber: [], course: [], changed: []};
      for (subhour = 0; subhour < amount_of_special_hours; subhour++) {
         var selected_hour = schedule.find('table').eq(day).find('tr').eq(subhour).find('td');
         //Give the value of the schedule hour to the fitting array.
         schedule_data[day][hour].teacher[subhour] = selected_hour.eq(0).text().replace(/\r|\n/g, '');
         schedule_data[day][hour].chamber[subhour] = selected_hour.eq(2).text();
         schedule_data[day][hour].course[subhour] = selected_hour.eq(4).text();
         //Check if the hour is 'changed' by the schedule authors, if so set to true.
         schedule_data[day][hour].changed[subhour] = selected_hour.eq(0).attr().class == 'tableCellNew' ? true : false;
      }
    }
  }

  schedule_data.types = types;

  return schedule_data;
}

//Exporting the schedule function.
module.exports = schedule;
