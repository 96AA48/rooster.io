//redirecter.js
/**
 * Module for redirecting the user based on what they typed into search.
 * @module redirecter
 * @author Bram van der Veen <96aa48@gmail.com>
 */


//Import first-party modules.
const qs = require('querystring');

/**
 * Module for redirecting the user after they did a search query in any of the
 * search forms.
 * @param {Object} req - Request object supplied by Express.
 * @param {Object} res - Response object supplied by Express.
 */
module.exports = function (req, res) {
  let referer = req.headers.referer.split('/')[3] || 'rooster';
  let _data = '';

  req.on('data', function (data) {
    _data += data;
  });

  req.on('end', function () {
    let query = qs.parse(_data);

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
