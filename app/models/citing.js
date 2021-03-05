'use strict';

const mongoose = require('mongoose')
	
const CitingSchema = new mongoose.Schema({
	blockchainTxn: {type: String, require: true},
	prefix: {type: String},
	title: {type: String, require: true},
	desc: {type: String},
	tags: {type: String},
	authors: {type: String},
	citingData: {type: String, required: true}, 
	fileOriginalName: {type: String},
	fileStoredName: {type: String},
	fileUrl: {type: String},
	submittingTime: {type: Date, default: Date.now },
	confirmedTime: {type: Date},
	confirmations: { type: Number, min: 0, default: 0 },
	owner: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	}
});

const Citing = mongoose.model('Citing', CitingSchema)

module.exports=Citing

