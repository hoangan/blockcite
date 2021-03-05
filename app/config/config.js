'use strict';

const get = (envName) => {return process.env[envName]}

const params = {
  env: get('ENV'),
	apiPrefix: get('API_PREFIX'),
	appPrefix: get('APP_PREFIX'),
	appSecret: get('APP_SECRET'),
	awsAccessKeyId: get('AWS_ACCESS_KEY_ID'),
	awsSecretAccessKey: get('AWS_SECRET_ACCESS_KEY'),
	blockchainAPIendpoint: get('BLOCKCHAIN_API_ENDPOINT'),
	bucketUrl: get('BUCKET_URL'),
	db: get('DB_URL'),
  dbHost: get('DB_HOST'),
  dbUsername: get('DB_USERNAME'),
  dbPassword: get('DB_PASSWORD'),
  dbName: get('DB_NAME'),
	s3Bucket: get('S3_BUCKET'),
	walletAddress: get('WALLET_ADDRESS'),
	walletPriKey: get('WALLET_PRI_KEY'),
  encryptionPublicKey: get('ENCRYPTION_PUBLIC_KEY')
};

module.exports=params;