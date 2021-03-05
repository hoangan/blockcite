'use strict'

const eccrypto = require('eccrypto');

const wallet = require('../utils/wallet')

const config = require('../config/config')
const {models} = require('../models')

const initializeEphemeralWallet = async () => {
  console.log('Initialize wallet...');
  if(config.env === 'PRODUCTION' || !config.walletPriKey) {
    const walletKeyPair = wallet.GenerateEphemeralWallet()

    config.walletAddress = walletKeyPair.address
    config.walletPriKey = walletKeyPair.privateKey
   
    var encryptionPublicKey = Buffer.from(config.encryptionPublicKey, 'hex')
    eccrypto.encrypt(encryptionPublicKey, Buffer.from(walletKeyPair.privateKey)).then(function(encryptedWalletPrivateKey) {
      var encryptedWalletPrivateKeyBase64 = Buffer.from(JSON.stringify(encryptedWalletPrivateKey)).toString('base64')
		  var ephemeralWallet = new models.EphemeralWallet();
      ephemeralWallet.address = walletKeyPair.address;
      ephemeralWallet.privateKey = encryptedWalletPrivateKeyBase64;
      ephemeralWallet.save(function(err) {
			  if(err) {
			  	console.log(err);
          throw(err)
			  }
      })
    });     
  }

  console.log('Please send some Bitcoin to this address for citing service to work: ', config.walletAddress)
}

exports.initializeEphemeralWallet = initializeEphemeralWallet