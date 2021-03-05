'use strict';

var config = require('./config');
var jwt = require('express-jwt');
var jwtauth = require('../utils/jwtauth');

module.exports =  function(app) {
	
	//var apiPrefix = config.apiPrefix;
	
	var citer = require('../controllers/cite.server.controller');
	app.post('/cite', jwtauth, citer.cite);
	app.get('/cite/verify', citer.verify);
	app.get('/cite/listcitings', jwtauth, citer.listAccountCitings);
	
	var index = require('../controllers/index.server.controller');
	app.get('/', index.index);
	
	var users = require('../controllers/users.server.controller');
	app.post('/users/create', users.create);
	app.post('/users/credit', jwtauth, users.credit);
	app.post('/users/login', users.login);
	app.post('/users/refreshtoken', jwtauth, users.refreshToken);
	app.post('/users/updatedetails', jwtauth, users.updateDetails);
	app.post('/users/updatepassword', jwtauth, users.updatePassword);
	
	// var upload = require('../controllers/upload.server.controller');
	// app.post('/upload', upload.process);
	
	// var download = require('../controllers/download.server.controller');
	// app.get('/download', download.s3);
};

