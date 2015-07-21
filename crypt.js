var crypto = require('crypto');

var clearEncoding = 'utf8';
var cipherEncoding = 'hex';
var algo = 'aes192';
var passwd = 'thisaintnosensitivedataatalldontreadthisorillgetmadatyourfaceyoumofo';

module.exports = {
	encrypt : function (str) {
		var cipher = crypto.createCipher(algo, passwd);
		var cipherChunks = [];

		cipherChunks.push(cipher.update(str, clearEncoding, cipherEncoding));
		cipherChunks.push(cipher.final(cipherEncoding));

		return cipherChunks[1];
	},
	decrypt : function (str) {
		str = [str];
		var plainChunks = [];
		try {
			var decipher = crypto.createDecipher(algo, passwd);

			for (var i = 0;i < str.length;i++) {
			  plainChunks.push(decipher.update(str[i], cipherEncoding, clearEncoding));
			}

			plainChunks.push(decipher.final(clearEncoding));
			return plainChunks.join('');
		}
		catch (err) {
			return str.join('');
		}
	}
}
