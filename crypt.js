//crypt.js
/**
 *  Module for encrypting and decrypting strings.
 * @module crypt
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Import first-party modules.
const crypto = require('crypto');

//Import self-written modules.
const config = require('./configuration');

//Set local constants.
const encoding = 'utf8';
const cryptEncoding = 'hex';
const algo = 'aes192';
const passwd = config().encryptionKey;

/**
 * Function for encrypting a string.
 * @param {String} str - String that you want to encrypt.
 * @return {String} encryptArray - Encrypted string.
 */
function encrypt(str) {
	let cipher = crypto.createCipher(algo, passwd);
	let encryptArray = [];

	encryptArray.push(cipher.update(str, encoding, cryptEncoding));
	encryptArray.push(cipher.final(cryptEncoding));

	return encryptArray.join('');
}

/**
 * Function to decrypt a string.
 * @param {String} str - String you want to decrypt
 * @return {String} The decrypted string.
 */
function decrypt(str) {
	let decipher = crypto.createDecipher(algo, passwd);
	let decryptArray = [];

	try {
		decryptArray.push(decipher.update(str, cryptEncoding, encoding));
		decryptArray.push(decipher.final(encoding));

		return decryptArray.join('');
	}
	catch (err) {
		return str.join('');
	}
}

//Export the functions as a module.
module.exports = {
	'encrypt': encrypt,
	'decrypt': decrypt
}
