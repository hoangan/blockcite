//'use strict';

var config = require('../config/config');
var jwt = require('jsonwebtoken');
var get_ip = require('ipware')().get_ip;
var util = require('util');
var User = require('mongoose').model('User');

module.exports = function(req, res, next) {
	
	// Log down attempt to authenticate
	var ip_info = get_ip(req);
	console.log('Attempted to authenticate: ');
	console.log(ip_info)
	
	var token = req.headers["x-access-token"];
	
	if(token) {	
		try {
			
			var decoded = jwt.verify(token, config.appSecret);
			if(decoded.exp <= Date.now) {
				console.log(decoded.exp);
				res.end('{"error": "Access token expired."}', 401);
			}
			
			// There should be a different type of token for frontend app login, 
			//    that no need to verify against the token stored in database, 
			//    recommend adding another field to token (e.g: 'app':true), with expired date much shorter. 
			User.findOne({_id : decoded.userId}, function(err, user) {
				
				if(err || !user) {
					res.end(util.format('{"error" : "Cannot find userId %s."}', decoded.userId));
				}
				else{
					// Log down the authenticated access
					console.log(user._id + ':' + user.email + ':');
					console.log(ip_info);
					
					if(decoded.web) {
						req.user = user;
						//res.end();
						return next();
					}
					else if(decoded.tk_ver != user.tokenVersion) {
						console.log('{"error" : "Access token is invalid for userId %s. Tokens versions are different."}', user._id);
						res.end(util.format('{"error" : "Access token is invalid for userId %s."}', decoded.userId), 401);
					}
					else {
						req.user = user;
						return next();
					}
				}
				
			});
			
		}
		catch(err) {
			console.log('Sig mismatch.');
			res.end('{"error": "Unauthorized."}', 401);
		}
		
	}
	else {
		res.end('{"error": "Unauthorized."}', 401);
	}
		
};