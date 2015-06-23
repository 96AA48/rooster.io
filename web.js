//web.js
var config = require('./configuration');
var express = require('express');
var less = require('express-less');
var app = express();

var lookup = require('./lookup');
var schedule = require('./schedule');

app.set('view engine', 'jade');
app.disable('view cache');
app.set('views', __dirname + '/resources/jade');
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
