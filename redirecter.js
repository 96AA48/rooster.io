//redirecter.js
var qs = require('querystring');

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
      res.redirect('/' + referer + '/' + query.search);
    }
  });

}
