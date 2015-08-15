//time.js
var config = require('./configuration');

//Function for getting the time, with minutes as a fracture.
function get() {
 var time = new Date();
 return time.getHours() + (time.getMinutes() / 60);
}

//Function for convert hh:mm to fractured time (hh.hh)
function parse(timestr) {
  var parsed = timestr.match(/\d{1,2}:\d+/g);
  var array = [];

  for (time of parsed) {
    array.push(parseInt(time.split(':')[0]) + (parseInt(time.split(':')[1]) / 60));
  }

  return array;
}

//Function for parsing and checking if the currrent time is within the parsed string.
function withinTimespan(timespan) {
  if (get() > parse(timespan)[0] && get() < parse(timespan)[1]) return true;
  else return false;
}

function duringSchool() {
  var start = parse(config().times[0])[0];
  var end = parse(config().times[config().times.length - 1])[1];

  if (get() > start && get() < end) return true;
  else return false;
}

module.exports = {
  'get': get,
  'withinTimespan': withinTimespan,
  'duringSchool': duringSchool
}
