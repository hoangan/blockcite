/// <reference path="../../typings/tsd.d.ts" />
'use strict';

const mongoose = require('mongoose')
	
const UserSchema = new mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	email: {type: String, unique: true, required: true, dropDups: true}, 
	password: {type: String, required: true}, 
	customId: String,
	creatingDate: { type: Date, default: Date.now },
	creditBalance: { type: Number, min: 0, default: 0 },
	active: {type: Boolean, default: true},
	frozen: {type: Boolean, default: false},
	admin: {type: Boolean, required: true, default: false},
	tokenVersion: {type: Number, min:0, default:0, required: true}
});

const User = mongoose.model('User', UserSchema);

module.exports=User