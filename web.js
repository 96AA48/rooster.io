//web.js
/**
 * Module/script for setting up the web frontend and binding all of the modules
 * together.
 * @module web
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Import first-party modules.
const fs = require('fs');

//Import third-party modules.
const express = require('express');
const less = require('express-less');
const body_parser = require('body-parser');

//Import self-written modules.
const api = require('./api');
const config = require('./configuration');
const lookup = require('./lookup');
const schedule = require('./schedule');
const auth = require('./auth');
const redirecter = require('./redirecter');
const time = require('./time');

//Setting local variables.
var app = express();

//Set up jade rendering engine.
app.set('view engine', 'pug');
config().env == 'dev' ? app.disable('view cache') : null; //If the environment is set on 'dev' then view cache should be disabled.
app.set('views', __dirname + '/resources/pug');

//Give the app some configuration information
app.locals.linkbar = config().linkbar;
app.locals.times = config().times;
app.locals.time = time;

//Set up all static directories for getting resources.
app.use('/css', less(__dirname + '/resources/less'));
app.use('/js', express.static(__dirname + '/resources/js'));
app.use('/other', express.static(__dirname + '/resources/other'));
app.use('/images', express.static(__dirname + '/resources/images'));

//Initialising homepage.
app.get('/', auth.is, function (req, res) {
  res.render('homepage', req);
});

//Initialize redirector when information is posted to the root of the website.
app.post('/', redirecter);

//Initialising behavior for searching.
app.param('search', lookup.get);

app.get('/rooster/:search', [auth.is, schedule.get, (req, res) => res.render('schedule', req)]);

//Initialising behavior for searching through lists.
app.param('list', lookup.list);

app.get('/klassenlijst/:list',[auth.is, (req, res) => res.render('list', req)]);

//Initialising login page frontend.
app.get('/login', (req, res) => res.render('login', req));

//Initialising login/logout behavior.
app.post('/login', auth.login);
app.get('/logout', auth.logout);

//Intialising API handler.
app.get('/api/:api', function (req, res, next) { next(); });
app.param('api', api);

//Initialize the server on configured web port.
app.listen(config().webPort, config().webHost);
console.log('Started rooster.io on port', config().webPort)
plugins();

/**
 * Function for initialising all of the plugins in the plugins/ directory.
 */
function plugins() {
  var pluginsDirectory = fs.readdirSync(__dirname + '/plugins');

  for (plugin of pluginsDirectory) {
    var app = __dirname + '/plugins/' + plugin + '/app.js';
    if (fs.existsSync(app)) {
      var app = require(app)(config().webPort + (1 + pluginsDirectory.indexOf(plugin)), config().webHost);
    }
  }
}
