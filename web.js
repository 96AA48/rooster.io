//web.js
var express = require('express');
var less = require('express-less');
var app = express();

var lookup = require('./lookup.js');
var schedule = require('./schedule.js');

app.set('view engine', 'jade');
app.disable('view cache');
app.set('views', __dirname + '/resources/jade');
app.use('/css', less(__dirname + '/resources/less'));
app.use('/js', express.static(__dirname + '/resources/js'));

app.get('/', function (req, res) {
    res.render('homepage');
});

app.post('/', function (req, res) {
  console.log(req);
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
  res.render('schedule', req);
  console.log(req);
});

app.listen(1024);
