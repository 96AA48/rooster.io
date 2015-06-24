//web.js
var express = require('express');
var less = require('express-less');
var body_parser = require('body-parser');

var config = require('./configuration');
var lookup = require('./lookup');
var schedule = require('./schedule');

var app = express();

//Set up jade rendering engine.
app.set('view engine', 'jade');
config().env == 'dev' ? app.disable('view cache') : null; //If the environment is set on 'dev' then view cache should be disabled.
app.set('views', __dirname + '/resources/jade');

//Set up all static directories for getting resources.
app.use('/css', less(__dirname + '/resources/less'));
app.use('/js', express.static(__dirname + '/resources/js'));
app.use('/other', express.static(__dirname + '/resources/other'));

app.get('/', function (req, res) {
  req.links = config().links;
  res.render('homepage', req);
});

app.get('/rooster/:search', function (req, res) {
  next();
});

app.get('/over', function (req, res) {
  res.send('Hier kun je lezen over werkmanrooster.');
});

app.param('search', lookup);
app.param('search', schedule);

app.param('search', function (req, res) {
  req.links = config().links;
  req.times = config().hour_times;
  res.render('schedule', req);
});

app.listen(config().web_port);
