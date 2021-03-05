'use strict';

var _ = require('lodash');
var bitcore = require('bitcore');
var JSUtil = bitcore.JSUtil;

var isHexa = function isHexa(value) {
  if (!_.isString(value)) {
    return false;
  }
  return /^[0-9a-fA-F]+$/.test(value);
};

exports.index = function(req, res) {
	res.render('index');
};


//	http.get(apiEndpoint + '/addr/' + address + '/utxo?noCache=1', function(apiRes){
//		var body = '';
//		console.log(apiRes.statusCode);
//		apiRes.on('data', function(chunk) {
//			body += chunk;
//		});
//		apiRes.on('end', function() {
//			console.log(body);
//		});
//	});