//time.js

//Function for getting the time, with minutes as a fracture.
function get() {
 var time = new Date();
 return time.getHours() + (time.getMinutes() / 60);
}

//Function for parsing and checking if the currrent time is within the parsed string.
function within_timespan(timespan) {

}

module.exports = {
  'get': get,
  'within_timespan': within_timespan
}
