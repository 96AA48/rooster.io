//time.js
/**
 * Module handling time related tasks.
 * Used for adding frontend features like showing what hour it currently is or
 * changing color because the school day is over.
 * @module time
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Importing self-written modules.
const config = require('./configuration');

/**
 * Function for getting the time, with minutes as a fracture.
 * @return {Float} time - The time, fractured (20.5 instead of 20:30)
 */
function get() {
 let time = new Date();
 return time.getHours() + (time.getMinutes() / 60);
}

/**
 * Function for convert hh:mm to fractured time (hh.mm)
 * @param {String} timestr - A string containing a time from and to (e.g "9:15 - 10:00")
 * @return {Array} array - An array containing the time string split in two.
 */
function parse(timestr) {
  let parsed = timestr.match(/\d{1,2}:\d+/g);
  let array = [];

  for (time of parsed) {
    array.push(parseInt(time.split(':')[0]) + (parseInt(time.split(':')[1]) / 60));
  }

  return array;
}

/**
 * Function for parsing and checking if the currrent time is within the parsed string.
 * @param {String} timespan - A string containing a time from and to (e.g "9:15 - 10:00")
 * @return {Boolean} Returns true if the current time is within the timespan or false when it's not.
 */
function withinTimespan(timespan) {
  if (get() > parse(timespan)[0] && get() < parse(timespan)[1]) return true;
  else return false;
}

/**
 * Function that uses withinTimespan() to determine if the current time is
 * within the earliest and the latest time strings.
  * @return {Boolean} - Returns true if the current time is within the timespan or false when it's not.
 */
function duringSchool() {
  let start = parse(config().times[0])[0];
  let end = parse(config().times[config().times.length - 1])[1];

  if (get() > start && get() < end) return true;
  else return false;
}

//Export the functions as a module.
module.exports = {
  'get': get,
  'withinTimespan': withinTimespan,
  'duringSchool': duringSchool
}
