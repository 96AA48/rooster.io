//api.js
/**
 * Module for handling API requests.
 * API is able to be called through /api/:apirequest?=arguments
 * @module api
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Importing self-written modules.
const lookup = require('./lookup');
const schedule = require('./schedule');

/**
 * Takes the information from the request
 * and tries to return information.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 * @param {Function} next - Next function supplied by Express.
 * @param {String} api - Type of API request supplied by the user.
 */
function parse(req, res, next, api) {
  req.api = true;

  if (api == 'search') {
    if (!req.query.name) error('You didn\'t send the needed queries: name', res);
    else {
      lookup.api(req, (lookup) => {
        if (lookup.error) error(lookup.error, res);
        else sendResponse(lookup.data, res);
      });
    }
  }
  else if (api == 'schedule') {
    if (!req.query.name) error('You didn\'t send the needed queries : name', res);
    else {
      lookup.api(req, (lookup) => {
        if (lookup.error) error(lookup.error, res);
        else {
          if (lookup.data.length > 1 || lookup.data.length == 0) error('The request that you did had multiple responses or none, make sure that your query returns one.', res, lookup.data)
          else {
            schedule.api(lookup, (scheduleData) => {
              sendResponse(scheduleData, res, true);
            });
          }
        }
      })
    }
  }
}

/**
 * Returns an error to the user when the request
 * was unable to complete.
 * @param {String} str - The error message to display.
 * @param {Object} res - Reponse object supplied by Express.
 * @param {Function} next - Next function supplied by Express.
 * @return {null}
 */
function error(str, res, data) {
  res.set('Content-Type', 'application/json');
  res.status(400).end(JSON.stringify({'error' : str, 'data' : data}, null, 2));
  return;
}

/**
 * Sends a response to the user that did an API request.
 * @param {Object} data - Data object with requested data.
 * @param {Object} res - Response object supplied by Express.
 * @param {Bool} disablePretty - Boolean to disable pretty printing of the response.
 * @return {null}
 */
function sendResponse(data, res, disablePretty) {
  res.set('Content-Type', 'application/json');
  res.status(200).end(JSON.stringify({'data': data}, null, disablePretty ? 0 : 2));
  return;
}

//Exporting the parse function as a module.
module.exports = parse;
