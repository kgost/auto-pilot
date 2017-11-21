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
		client.post('statuses/retweet/' + user.potentialRTs[k].id, function(error, tweet, response) {
			let recentUser = false;
			let start = 0;
			let end = user.usersTwoDays.length - 1;

			while ( start <= end ) {
				let mid = ( int ) ( ( end + start ) / 2 );

				if ( user.usersTwoDays[mid].id == user.potentialRTs[k].id ) {
					user.usersTwoDays[mid].count += 1;
					recentUser = true;
					break;
				} else if ( user.usersTwoDays[mid].id < user.usersTwoDays[i].id ) {
					start = mid + 1;
				} else if ( user.usersTwoDays[mid].id > user.usersTwoDays[i].id ) {
					end = mid - 1;
				}
			}

			if ( !recentUser ) {
				user.usersTwoDays.splice( start, 0, { date: ( Number ) ( new Date() ), id: user.potentialRTs[k].userId, count: 1 } );
			}

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
