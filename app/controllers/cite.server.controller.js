/// <reference path="../../typings/tsd.d.ts" />

'use strict';

var _ = require('lodash');
var buffer = require('buffer');
var util = require('util');

var crypto = require('crypto');
var sha256 = crypto.createHash('sha256');

var express = require('express');
var http = require('http');
var aws = require('aws-sdk');
var fs = require('fs');
var fileExtension = require('file-extension');
var mongoose = require('mongoose');
var httpFileExtension = require('../utils/http_file_extension');

var bitcore = require('bitcore');
var explorers = require('bitcore-explorers');
var JSUtil = require('../../node_modules/bitcore/lib/util/js');
var Output = require('../../node_modules/bitcore/lib/transaction/output');

var User = require('mongoose').model('User');
var Citing = require('mongoose').model('Citing');

var insight = new explorers.Insight();

var config = require('../config/config');

var address = config.walletAddress;
var priKey  = new bitcore.PrivateKey(config.walletPriKey);

var async = require('async');

var httpReq = require('../utils/httprequest.js');

var CITING_FEE = 1;
var MAX_CITING_DATA_SIZE = 40; // 40 bytes

aws.config.update({
	accessKeyId: config.awsAccessKeyId,
	secretAccessKey: config.awsSecretAccessKey
});

var s3 = new aws.S3(); 

exports.cite = function(req, res) {
	
	var citingData = req.body.citing_data;
	var isHexData = req.body.is_hex;
	var useCustomPrefix = req.body.use_custom_prefix;
	var useBlkCitePrefix = req.body.use_blkcite_prefix;
	
	// utils/jwtauth added user to request during authentication 
	var retrievedUser = req.user;
	
	if(retrievedUser .creditBalance < CITING_FEE) {
		res.send('{"error" : "Not enough credit balance to do citing."}', 400);
		return;
	}
	
	if(retrievedUser === null){
		res.send('{"error" : "Cannot find user."}', 400);
		return;
	}
		
	// Check data size, must <= 40 bytes in total
	var totalDataSize = 0;
	
	if(isHexData) {
		totalDataSize = totalDataSize + citingData.length / 2;
	}
	else {
		totalDataSize = totalDataSize + citingData.length;
	}
	
	if(useCustomPrefix === true && retrievedUser.customId) {
		totalDataSize = totalDataSize + retrievedUser.customId.length;
	}
	
	if(totalDataSize > MAX_CITING_DATA_SIZE) {
		res.send('{"error" : "Total citing data (including prefix, if any) exceeds 40 bytes."}', 400);
		return;
	}
	
	insight.getUnspentUtxos(address, function(err, utxos) {
		
		var amount = 0;
		_.each(utxos, function(utxo) {
			amount += utxo.satoshis;
		});
		
		// Deduct transaction fee of 1000 satoshis
		amount = amount - 1000;
		
		var transaction = new bitcore.Transaction()
				.from(utxos)
				.to(address, amount);
		
		var prefix = '';
		
		if(useCustomPrefix && retrievedUser.customId) {
			prefix = retrievedUser.customId; 
		}
		else if(useBlkCitePrefix) {
			prefix = config.appPrefix;
		}
		
		// Adding op_return hexa or text
		if(JSUtil.isHexa(citingData)) {
			
			// Convert prefix to hexa
			prefix =  (new Buffer(prefix)).toString('hex');
			
			// Add hexa data to transaction
			transaction.addData(new Buffer(prefix + citingData, 'hex'));
			
		}
		else{
			transaction.addData(prefix + citingData);
		}
		
		transaction.sign(priKey);
		
		var serializedTxn = transaction.serialize();
		
		console.log('Broadcasting citing data: %s to the blockchain...', citingData);
		
		insight.broadcast(serializedTxn, function(err, id) {
			if (err) {
				console.log('Cannot broadcast citing data: %s to the blockchain', citingData, err);
				//console.log(err);
				res.send('{"error" : "Cannot broadcast to the blockchain network. Please contact out support."}');
			}
			else{
				var citing = new Citing();
				citing.blockchainTxn = id;
				citing.citingData = citingData;
				citing.owner = retrievedUser;
				
				if(prefix) {
					citing.prefix = prefix;
				}
				
				if(req.files.file) {
					
					var file = req.files.file;
					
					console.log('Uploading file: %s to blockcite bucket...', file.name);
					
					citing.fileOriginalName = req.files.file.originalname;
					citing.fileStoredName = req.files.file.name;
					citing.fileUrl = config.bucketUrl + req.files.file.name;
					citing.authors = retrievedUser.firstName;
					
					var params = {
						Bucket: 'blockcite',
						Key: file.name,
						Body: fs.createReadStream(file.path),
						ContentType: httpFileExtension.get(fileExtension(file.name))	
					};
					
					s3.putObject(params, function(err, res) {
						if(err) {
							console.log("Error uploading! File: %s", file.name, err);
						}
						else {
							console.log(util.format("Successfully uploading to blockcite bucket! File: %s", file.name), res);
						}
					});
				}
				
				citing.save(function(err) {
					if(err) {
						console.log(err);
						res.end('{"error" : "Broadcast suceeded, however cannot save it to blockCITE db. Please contact our support."}', 400);
					}
					else {
						var newBalance = retrievedUser.creditBalance - CITING_FEE;
						retrievedUser.update({creditBalance : newBalance}, function(err, rawResponse){
							if(err) {
								console.log('error : update account credit balance : ' + retrievedUser.id);
								console.log(err);
								res.end('{"error" : "Error updating account balance. Please contact our support."}');
							}
							else {
								console.log('{"success" : "%s"}', id);
								var resObj = {};
								resObj.status = 'success';
								resObj.file_name = citing.fileOriginalName;
								resObj.owner = retrievedUser.firstName; 
								resObj.authors = citing.authors;
								resObj.cited_time = citing.submittingTime;
								resObj.citing_data = citing.citingData;
								resObj.blockchain_txn = citing.blockchainTxn;
								
								res.end(JSON.stringify(resObj));
							}
						});
					}
				});
			}
		});
	});
};

exports.verify = function(req, res) {
	if(req.query.citingdata) {
		return this.verifyDataHash(req, res);
	}
	else if(req.query.transactionid) {
		return this.verifyTransactionId(req, res);
	}
	else {
		res.end('error');
	}
};

exports.verifyDataHash = function(req, res) {
	var citingData = req.query.citingdata;
	var blockchainTxn;
	var rawTransaction;
	var citing;
	
	async.series([
		function(callback) {
			Citing.findOne({citingData : citingData}, function(err, cit) {
				if(err || !cit) {
					res.end(util.format('{"error" : "Cannot find this citing in database. Citing: %s"}', citingData));
					return;
				}
				else {
					blockchainTxn = cit.blockchainTxn;
					citing = cit;
				}
				callback();
			});
		},
		function(callback) {
			httpReq.get(
				'https://node.blockcite.com/api/tx/' + blockchainTxn,
				function(err, res1, body) {
					if(res.statusCode === 200) {
						rawTransaction  = JSON.parse(body);
					}
					callback();
				}
			);
		}
	],
	function() {
		if(!rawTransaction) {
			res.end(util.format('{"error" : "Citing is not in the blockchain. Citing: %s"}'), citingData);
			return;
		}
		else {
			try{
				var citingData = rawTransaction.vout[1].scriptPubKey.asm.split(' ')[1];
				var submittingTime = citing.submittingTime;
				var confirmingTime = new Date(rawTransaction.time * 1000);
				var blockHash = rawTransaction.blockhash;
				var confirmations = rawTransaction.confirmations;
				
				// Update number of confirmations into internal database
				Citing.update({_id: citing._id}, {$set: { confirmations: confirmations}}).exec();
				
				var resObj = {};
				resObj.blockchainTxn = blockchainTxn;
				resObj.citingData = citingData;
				resObj.submittingTime = submittingTime;
				resObj.confirmingTime = confirmingTime;
				resObj.blockHash = blockHash;
				resObj.confirmations = confirmations;
				
				res.end(JSON.stringify(resObj));
			}
			catch(err) {
				res.end(util.format('{"error" : "Error happened while verifying citing. Citing: %s "}', citingData));
			}
		}
	});
};

exports.verifyTransactionId = function(req, res) {
	
	var citingData; 
	var blockchainTxn = req.query.transactionid;
	var rawTransaction;
	var citing;
	
	async.series([
		function(callback) {
			Citing.findOne({blockchainTxn : blockchainTxn}, function(err, cit) {
				if(err || !cit) {
					res.end(util.format('{"error" : "Cannot find this transaction_id in the database. TransactionId: %s"}', blockchainTxn));
					return;
				}
				else {
					citingData = cit.citingData;
					citing = cit;
				}
				callback();
			});
		},
		function(callback) {
			httpReq.get(
			'https://node.blockcite.com/api/tx/' + blockchainTxn,
			function(err, res1, body) {
				if(res.statusCode === 200) {
					rawTransaction  = JSON.parse(body);
				}
				callback();
			}
		);
		}
	],
	function() {
		if(!rawTransaction) {
			res.end(util.format('{"error" : "Transaction is not in the blockchain. BlockchainTxn: %s"}'), blockchainTxn);
			return;
		}
		else {
			try{
				var citingData = rawTransaction.vout[1].scriptPubKey.asm.split(' ')[1];
				var submittingTime = citing.submittingTime;
				var confirmingTime = new Date(rawTransaction.time * 1000);
				var blockHash = rawTransaction.blockhash;
				var confirmations = rawTransaction.confirmations;
				
				// Update number of confirmations into internal database
				Citing.update({_id: citing._id}, {$set: { confirmations: confirmations}}).exec();
				
				var resObj = {};
				resObj.blockchainTxn = blockchainTxn;
				resObj.citingData = citingData;
				resObj.submittingTime = submittingTime;
				resObj.confirmingTime = confirmingTime;
				resObj.blockHash = blockHash;
				resObj.confirmations = confirmations;
				
				res.end(JSON.stringify(resObj));
			}
			catch(err) {
				res.end(util.format('{"error" : "Error happened while verifying citing. TransactionId: %s "}', blockchainTxn));
			}
		}
	});
	
};

exports.listAccountCitings = function(req, res) {
	
	var ownerId = new mongoose.Types.ObjectId(req.user._id); 
	var lim = ((req.query.limit > 0) ? req.query.limit : 1);
	var order = ((req.query.sort === 'desc') ? -1 : 1);
	
	console.log()
	
	Citing.
		find({owner : ownerId}).
		sort({submittingTime : order}).
		limit(lim).
		exec(
			function(err, citings) {
				if(err || !citings) {
					res.end(util.format('{"error" : "Cannot find this accounts citings in database. AccountId: %s"}', req.user._id), 400);
					return;
				}
				else {
					res.end(JSON.stringify(citings));
				}
			}
		);
};
	
var buildHexDataOut = function(data) {
	
	var s = new bitcore.Script();
	s.add(bitcore.Opcode.OP_RETURN);
	s.add(new Buffer(data, 'hex'));
	
	return s;
};


// transaction.addOutput(new Output({
	// 			    script: buildHexDataOut(req.body.data),
	// 			    satoshis: 0
	// 			}));

