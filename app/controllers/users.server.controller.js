'use strict';

var User = require('mongoose').model('User');
var usersService = require('../services/users.server.service');
var randomstring = require("randomstring");
var passwordHash = require('../utils/passwordhash.js');
var jwt = require('jsonwebtoken');
var util = require('util');
var config = require('../config/config');

exports.create = function(req, res, next) {
	var user = new User();
	user.email = req.body.email;
	user.firstName = req.body.firstName;
	user.lastName = req.body.lastName;
	user.customId = req.body.customId;
	
	var pwdHash = passwordHash.generate(req.body.password);
	
	if(pwdHash === '') {
		res.send('{"error" : "Password cannot be empty."}', 400);
	}
	
	// Update password hash
	user.password = pwdHash;
	
	// Create access token base on userId
	user.accessToken = jwt.sign({userId: user._id, tk_ver: 0}, config.appSecret, {expiresInMinutes: 60*24*365});
	
	// Save to db
	user.save(function(err) {
		if(err) {
			console.log(err.toString());
			res.end('{"error": "Cannot create user."}', 400);
		}
		else {
			res.send(util.format('{"userId" : "%s" ,"x-access-token" : "%s"}', user._id, user.accessToken));
		}
	});
};

exports.credit =  function(req, res, next) {
	
	// Check for admin role after jwtauth doing token authorization.  
	if(!req.user || req.user.admin !== true) {
		res.end('{"error" : "Unauthorized."}', 401);
		return;
	}
	
	User.findByIdAndUpdate( req.body.creditUserId, {$inc: {creditBalance: req.body.creditAmount}}, {new : true}, function(err, creditUser) {
		if(err || !creditUser) {
			res.end(util.format('{"error" : "Cannot update balance for userId %s."}', req.body.creditUserId));
		}
		else {
			res.end(util.format('{"balance" : "%s"}', creditUser.creditBalance));
		}
	});
	
};

exports.updatePassword = function(req, res, next) {
	
	var pwdHash = passwordHash.generate(req.body.password);
	
	if(pwdHash === '') {
		res.send('{"error" : "Password cannot be empty."}', 400);
	}
	
	if(!req.user) {
		res.end('{"error" : "Unauthorized."}', 401);
	}
	
	User.findByIdAndUpdate( req.user._id, {$set: {password: pwdHash}}, {new : true}, function(err, updatedUser) {
		if(err || !updatedUser) {
			res.end(util.format('{"error" : "Cannot update password for userId %s."}', req.user._id), 500);
		}
		else {
			res.end('{"success" : "Password updated."}');
		}
	});
};

exports.updateDetails = function(req, res, next) {
	
	if(!req.user) {
		res.end('{"error" : "Unauthorized."}', 401);
	}
	
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var customId = req.body.customId;
	var email = req.body.email;
	
	User.findByIdAndUpdate(
		req.user._id,
		{ $set: {firstName: firstName, lastName: lastName, email: email, customId: customId}},
		{new: true},
		function(err, updatedUser) {
			if(err || !updatedUser) {
				res.end(util.format('{"error" : "Cannot update details for userId %s."}', req.user._id), 500);
			}
			else {
				res.end('{"success" : "User details updated."}');
			}
		}
	);
	
};

exports.refreshToken = function(req, res, next) {
	
	if(!req.user) {
		res.end('{"error" : "Unauthorized."}', 401);
		return;
	}
	
	var newTokenVersion = req.user.tokenVersion + 1;
	
	var newToken = jwt.sign(
						{userId: req.user._id, tk_ver: newTokenVersion}, 
						config.appSecret, 
						{expiresInMinutes: 60*24*365}
					);
	
	User.findByIdAndUpdate(
		req.user._id,
		{ $set: {tokenVersion: newTokenVersion}},
		{new: true},
		function(err, updatedUser) {
			if(err || !updatedUser) {
			res.end(util.format('{"error" : "Cannot refresh token for userId %s."}', req.user._id), 500);
			}
			else {
				res.end(util.format('{"success" : "%s"}', newToken));
			}
		}
	);
	
};

exports.login = function(req, res, next) {
	// Create access token base on userId, set app: true for differentiating with api call token
	// var accessToken = jwt.sign({userId: user._id, app: true}, config.appSecret, {expiresInMinutes: 60});
	User.findOne({email : req.body.email}, function(err, user) {
		if(err || !user || !passwordHash.verify(req.body.password, user.password)) {
			res.end('{"error" : " Invalid credentials."}', 401);
		}
		else {
			var accessToken = jwt.sign({userId: user._id, web: true}, config.appSecret, {expiresInMinutes: 60});
			res.end(util.format('{"x-access-token" : "%s"}', accessToken));
		}
	});
};