//web.js
var express = require('express');
var lookup = require('./lookup.js');
var schedule = require('./schedule.js');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.param('search', lookup);
app.param('search', schedule);

app.get('/rooster/:search', function (req, res) {
  next();
});

app.get('/over', function (req, res) {
  res.send('Hier kun je lezen over werkmanrooster.');
});

app.listen(1024);
