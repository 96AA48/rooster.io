//authv2.js
var qs = require('querystring');
var https = require('socks5-https-client');

var crypt = require('./crypt');
var config = require('./configuration');

function get_login(username, password, callback) {
	var login = qs.stringify({
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
		socksPort: config().tor_port,
	  socksHost: config().tor_host
	}, function (res) {
		if (res.statusCode == 201 || res.statusCode == 200) callback(true);
		else callback(false);
	}).write(login);
}

function login(req, res, next) {
	var _data = '';

	req.on('data', function (data) {
		_data += data;
	});

	req.on('end', function () {
		var login_information = qs.parse(_data)

		get_login(login_information.username, login_information.password, function (legit) {
			var username = crypt.encrypt(login_information.username);
			var password = crypt.encrypt(login_information.password);
			if (legit) {
		    res.cookie('username', username);
		    res.cookie('password', password);
				res.redirect('/');
			}
			else {res.end('Er is wat mis, misschien je wachtwoord?')}
		});
	});
}

function logout(req, res) {
	res.cookie('username', '');
	res.cookie('password', '');
	res.redirect('/');
}

function is(req, res, next) {
	var cookies = qs.parse(req.headers.cookie.replace(/\s/g, ''), ';', '=');
	console.log(cookies);
	if (!cookies.username || !cookies.password) {next(); return;}

	var username = crypt.decrypt(cookies.username),
	password = crypt.decrypt(cookies.password);
	console.log(username, password);

	get_login(username, password, function (legit) {
		if (legit) {
			console.log('Username and password were legit');
			req.headers.username = username;
			// req.headers.password = password;
		}

		next();
	});
}

module.exports = {
	'login' : login,
	'logout' : logout,
	'is' : is
}
