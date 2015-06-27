//api.js
var lookup = require('./lookup');
var schedule = require('./schedule');

function parse(req, res, next, api) {
  req.api = true;

  if (api == 'search') {
    if (!req.query.name) error('You didn\'t send the needed queries: name', res);
    else {
      lookup.api(req, function (lookup) {
        if (lookup.error) error(lookup.error, res);
        else response(lookup.data, res);
      });
    }
  }
  else if (api == 'schedule') {
    if (!req.query.name) error('You didn\'t send the needed queries : name', res);
    else {
      lookup.api(req, function (lookup) {
        if (lookup.error) error(lookup.error, res);
        else {
          if (lookup.data.length > 1 || lookup.data.length == 0) error('The request that you did had multiple responses or none, make sure that your query returns one.', res, lookup.data)
          else {
            console.log(lookup.data);
            schedule.api(lookup, function (schedule_data) {
              response(schedule_data, res, true);
            });
          }
        }
      })
    }
  }
}

function error(str, res, data) {
  res.set('Content-Type', 'application/json');
  var error = JSON.stringify({'error' : str, 'data' : data}, null, 2);
  res.status(400).end(error);
  return;
}

function response(data, res, disable_pretty) {
  res.set('Content-Type', 'application/json');
  var response = JSON.stringify({'data': data}, null, disable_pretty ? 0 : 2);
  res.status(200).end(response);
  return;
}

module.exports = parse;
