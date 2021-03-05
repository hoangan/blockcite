'use strict';

var Citing = require('mongoose').model('Citing');

exports.findCitingsByUserId = function(userId) {
	Citing.find({'owner': userId}, function(err, citings) {
		if (err) {
			return null;
		}
		else {
			return citings;
		}
	});
};