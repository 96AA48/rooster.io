//auth.js
/**
 *  Module for handling the Authentication in the web application.
 * @module auth
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Importing first and third-party modules.
const qs = require('querystring');
const https = require('socks5-https-client');

//Importing self-written modules.
const crypt = require('./crypt');
const config = require('./configuration');
const lookup = require('./lookup');

/**
 * Function for starting a login request with the Magister servers.
 * @param {String} username - Username needed for login.
 * @param {String} password - Password needed for login.
 * @param {Function} callback - Callback function to be called after request.
 */
function getLogin(username, password, callback) {
	let login = qs.stringify({
		GebruikersNaam : username,
		Wachtwoord : password
	});

	https.request({
		host : 'werkman.magister.net',
		port : 443,
		path : '/api/sessie',
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length' : login.length
		},
		socksPort: config().torPort,
	  socksHost: config().torHost
	}, (res) => {
		if (res.statusCode == 201 || res.statusCode == 200) callback(true);
		else callback(false);
	}).write(login);
}

/**
 * Function for doing a login to the rooster.io server
 * this is being called by the web frontend when the
 * user logs in.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 * @param {Function} next - Next function supplied by Express.
 */
function login(req, res, next) {
	let _data = '';

	req.on('data', (data) => {
		_data += data;
	});

	req.on('end', () => {
		let loginInformation = qs.parse(_data)

		getLogin(loginInformation.username, loginInformation.password, (legit) => {
			let username = crypt.encrypt(loginInformation.username);
			let password = crypt.encrypt(loginInformation.password);
			if (legit) {
		    res.cookie('username', username);
		    res.cookie('password', password);
				res.redirect('/');
			}
			else {res.end('Er is wat mis, misschien je wachtwoord?')}
		});
	});
}

/**
 * Function for logging a user out
 * of a session on rooster.io.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 */
function logout(req, res) {
	res.cookie('username', '');
	res.cookie('password', '');
	res.redirect('/');
}

/**
 * Function for checking if the user is currently authenticated.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 * @param {Function} next - Next function supplied by Express.
 */
function is(req, res, next) {
	let cookies = qs.parse((req.headers.cookie || '').replace(/\s/g, ''), ';', '=');
	if (!cookies.username || !cookies.password) {next(); return;}

	let username = crypt.decrypt(cookies.username),
	password = crypt.decrypt(cookies.password);

	getLogin(username, password, (legit) => {
		if (legit) {
			req.query.name = username;
			lookup.api(req, (databaseEntry) => {
				req.headers.user = databaseEntry.data[0];
				next();
			});
		}
		else {
			next();
		}
	});
}

//Exporting the functions as a module.
module.exports = {
	'login' : login,
	'logout' : logout,
	'is' : is
}
