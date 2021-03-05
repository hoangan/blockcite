'use strict';

var User = require('mongoose').model('User');
var randomstring = require("randomstring");
var passwordHash = require('../utils/passwordhash.js');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var util = require('util');

exports.findUserById = function(id) {
	User.findById(id, function(err, user) {
		if(err) {
			console.log(err);
			return null;
		}
		else {
			return user;
		}
	});
};
