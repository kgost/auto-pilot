const Twitter 		= require( 'twitter' ),
			mongoose 		= require( 'mongoose' ),
			async				= require( 'async' ),
			User				= require( './models/user' ),
			DefaultUser	= require( './models/defaultUser' );

mongoose.connect( 'mongodb://localhost/auto_pilot' );

User.find( {}, function( err, users ) {
	if ( err ) {
		throw err;
	}

	async.map( users, function( user, callback ) {
		const client = new Twitter({
			consumer_key: user.cKey,
			consumer_secret: user.cSecret,
			access_token_key: user.aKey,
			access_token_secret: user.aSecret,
		});

		var retweets = [];

		for ( let i = user.potentialRTs.length - 1; i >= 0 && retweets.length < 10; i-- ) {
			if ( user.potentialRTs[i].followingUser ) {
				retweets.push( i );
			}
		}

		for ( let i = user.potentialRTs.length - 1; i >= 0 && retweets.length < 10; i-- ) {
			retweets.push( i );
		}

		let k = Math.floor( Math.random() * retweets.length );
		console.log( 'statuses/retweet/' + user.potentialRTs[k].id );
		client.post('statuses/retweet/' + user.potentialRTs[k].id, function(error, tweet, response) {
			console.log( tweet );

			user.potentialRTs.splice( k, 1 );
			user.save( function( err ) {
				callback( err );
			} );
		});
	}, function( err, results ) {
		if ( err ) {
			console.log( err );
		}

		process.exit();
	} );
} );
