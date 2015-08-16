//crypt.js
/**
 *  Module for encrypting and decrypting strings.
 * @module crypt
 * @author Bram van der Veen <96aa48@gmail.com>
 */

//Import first-party modules.
var crypto = require('crypto');

//Set local variables.
var encoding = 'utf8';
var cryptEncoding = 'hex';
var algo = 'aes192';
var passwd = 'JMU6DAQpzt32hJ2WndJxFvk3WHWqFcscq9yMMYkr8kgTtsam';

//Prepare the ciphering and deciphering.
var cipher = crypto.createCipher(algo, passwd);
var decipher = crypto.createDecipher(algo, passwd);

/**
 * Function for encrypting a string.
 * @param {String} str - String that you want to encrypt.
 * @return {String} encryptArray - Encrypted string.
 */
function encrypt(str) {
	var encryptArray = [];

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
	var decryptArray = [];

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
