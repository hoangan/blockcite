const bitcore = require('bitcore');
const eccrypto = require('eccrypto');

exports.GenerateEphemeralWallet = function() {
  const privateKey = new bitcore.PrivateKey();
  const address = privateKey.toAddress().toString();

  return {address:address, privateKey: privateKey.toWIF()}
}
