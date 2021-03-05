/// <reference path="typings/tsd.d.ts" />

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

//var methodOverride = require('method-override');
const {connectDb, models} = require('./app/models')
const initializeEphemeralWallet = require('./app/init/ephemeralwallet').initializeEphemeralWallet

var multer  = require('multer');
var config = require('./app/config/config');

var wallet = require('./app/utils/wallet')
var crypto = require('./app/utils/crypto')

//var db = mongoose();
var app = express();

(async () => {
  await connectDb()
  await initializeEphemeralWallet()
  const wallet = await models.EphemeralWallet.find({})
  console.log(wallet)
})()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
       extended: true
 }));

app.use(express.static('./public'));

app.use(multer({ 
	dest: '../blockcite_uploads/',
	rename: function(fieldname, filename, req, res) {
		var filehash =  req.body.citing_data;
		return filename.replace(/\W+/g, '-').toLowerCase() + '-t' + Date.now() + '-' + filehash;
	}
}));

app.set('view engine', 'ejs');
app.set('views', './app/views')

// defines routes
require('./app/config/routes')(app);

console.log(crypto.GenerateECIESKeyPair())

app.listen(8080, function(){
	console.log('Listening on port 8080...');
});