//web.js
var express = require('express');
var less = require('express-less');
var body_parser = require('body-parser');
var fs = require('fs');

var api = require('./api');
var config = require('./configuration');
var lookup = require('./lookup');
var schedule = require('./schedule');
var auth = require('./auth');

var app = express();

//Set up jade rendering engine.
app.set('view engine', 'jade');
config().env == 'dev' ? app.disable('view cache') : null; //If the environment is set on 'dev' then view cache should be disabled.
app.set('views', __dirname + '/resources/jade');

//Set up all static directories for getting resources.
app.use('/css', less(__dirname + '/resources/less'));
app.use('/js', express.static(__dirname + '/resources/js'));
app.use('/other', express.static(__dirname + '/resources/other'));

//Other things that need to be setup
// app.use(body_parser);

app.get('/', auth.is, function (req, res) {
  req.links = config().links;
  res.render('homepage', req);
});

app.get('/login', function (req, res) {
  res.render('login', req);
});

app.post('/login', auth.login);
app.get('/logout', auth.logout);

app.get('/api/:api', function (req, res, next) { next(); });
app.param('api', api);

app.get('/rooster/:search', function (req, res, next) {
  next();
});

app.param('search', auth.is);
app.param('search', lookup.get);
app.param('search', schedule.get);

app.param('search', function (req, res) {
  req.links = config().links;
  req.times = config().hour_times;
  res.render('schedule', req);
});

app.listen(config().web_port);
plugins();

function plugins() {
  var plugins_directory = fs.readdirSync(__dirname + '/plugins');

  for (plugin of plugins_directory) {
    var app = __dirname + '/plugins/' + plugin + '/app.js';
    if (fs.existsSync(app)) {
      var app = require(app)(config().web_port + (1 + plugin.indexOf(plugins_directory)));
    }
  }

}
