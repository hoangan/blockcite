const eccrypto = require('eccrypto');

exports.GenerateECIESKeyPair = function() {
  var privateKey = eccrypto.generatePrivate();
  var publicKey = eccrypto.getPublic(privateKey);

  return {privateKey: privateKey.toString('hex'), publicKey: publicKey.toString('hex')}
}