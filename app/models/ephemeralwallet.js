'use strict';

const mongoose = require('mongoose');

const EphemeralWalletSchema = new mongoose.Schema({
	address: {type: String},
  privateKey: {type: String}
});

const EphemeralWallet = mongoose.model('EphemeralWallet', EphemeralWalletSchema);

module.exports=EphemeralWallet