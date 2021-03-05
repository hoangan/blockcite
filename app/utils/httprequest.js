'use strict';

var request = require('request');

exports.post = function(urlz, headers, data, callback) {
	request({
		method: 'POST',
		url: urlz,
		headers: headers,
		json: data
	}, callback);
};

exports.get = function(urlz, headers, callback) {
	request({
		method: 'GET',
		url: urlz,
		headers: headers
	}, callback);
};