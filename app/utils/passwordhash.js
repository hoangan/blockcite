var crypto = require('crypto');
var ITERATIONS = 1000;
var KEY_LEN = 32; 
var SALT_LEN = 8;
var HASH_FUNC = 'sha256';

exports.generate = function(pwd) {
	try {
		var salt = crypto.randomBytes(SALT_LEN).toString('hex');
		var hash  = crypto.pbkdf2Sync(pwd, salt, ITERATIONS, KEY_LEN, HASH_FUNC).toString('hex');
		return salt + hash;
	}
	catch(ex) {
		console.log('error generating password hash');
		return '';
	}
};

exports.verify = function(pwd, pwdHash) {
	try {
		var salt = pwdHash.substr(0, 16);
		var hash = pwdHash.substr(16, pwdHash.lenght);
		
		var computingHash = crypto.pbkdf2Sync(pwd, salt, ITERATIONS, KEY_LEN, HASH_FUNC).toString('hex');
		
		return computingHash === hash;
	}
	catch(ex) {
		console.log(ex.toString());
		return false;
	}

};