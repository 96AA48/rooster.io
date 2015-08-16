//redirecter.js
/**
 * Module for redirecting the user based on what they typed into search.
 * @module redirecter
 */


//Import first-party modules.
var qs = require('querystring');

/**
 * Module for redirecting the user after they did a search query in any of the
 * search forms.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 */
module.exports = function (req, res) {
  var referer = req.headers.referer.split('/')[3] || 'rooster';
  var _data = '';

  req.on('data', function (data) {
    _data += data;
  });

  req.on('end', function () {
    var query = qs.parse(_data);

    if (query && query.search != '') {
      query.search = query.search.trim();

      if (query.search == 'hoewerkt') res.redirect('http://hoewerkt.werkmanrooster.nl');
      else res.redirect('/' + referer + '/' + query.search);
    }
    else {
      res.redirect('/');
    }
  });

}
