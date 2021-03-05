const mongoose = require('mongoose');
const config = require('../config/config')

const Citing = require('./citing')
const EphemeralWallet = require('./ephemeralwallet')
const User = require('./user')

const connectDb = async () => {
	const db = await mongoose.connect(`mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`);
  return db
}

const models = {Citing, EphemeralWallet, User}

module.exports={connectDb, models}