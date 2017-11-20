const Twitter = require( 'twitter' );

const client = new Twitter({
	consumer_key: process.env.C_KEY,
	consumer_secret: process.env.C_SECRET,
	access_token_key: process.env.A_KEY,
	access_token_secret: process.env.A_SECRET,
});

module.exports = client;