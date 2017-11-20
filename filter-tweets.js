const Twitter 		= require( 'twitter' ),
			mongoose 		= require( 'mongoose' ),
			async				= require( 'async' ),
			User				= require( './models/user' ),
			DefaultUser	= require( './models/defaultUser' );

mongoose.connect( 'mongodb://localhost/auto_pilot' );

const endTime = ( Number ) ( new Date() ) + 43200000;
let streams = [];

DefaultUser.findOne( {}, function( err, defaults ) {
	if ( err ) {
		throw err;
	}

	User.find( {}, function( err, users ) {
		if ( err ) {
			throw err;
		}

		let user = users[0];
		let defaultsId = defaults._id;

		async.map( users, function( user, callback ) {
			callback( null, startStream( user, defaults._id ) );
		}, function( err, results ) {
			if ( err ) {
				console.log( err );
			}

			for ( let i = 0; i < results.length; i++ ) {
				console.log( results[i] );
			}
		} );

		while ( true ) {
			if ( ( Number ) ( new Date() ) >= endTime ) {
				process.exit();
			}
		}
	} );
} );

function startStream( user, defaultsId ) {
	let result = {};
	result.user = user;
	result.defaultsId = defaultsId;

	result.client = new Twitter({
		consumer_key: user.cKey,
		consumer_secret: user.cSecret,
		access_token_key: user.aKey,
		access_token_secret: user.aSecret,
	});

	result.track = '';

	for ( let i = 0; i < result.user.filterTerms.length; i++ ) {
		result.track += result.user.filterTerms[i];

		if ( i != result.user.filterTerms.length - 1 ) {
			result.track += ',';
		}
	}

	result.stream = result.client.stream( 'statuses/filter', { track: result.track, tweet_mode: 'extended' } );

	result.stream.on( 'data', function( event ) {
		if ( event.user && !event.retweeted_status && !event.possibly_sensitive && event.user.followers_count >= 50000 && event.lang == 'en' ) {
			let text = ( event.truncated ) ? event.extended_tweet.full_text : event.text;

			User.findById( result.user._id, function( err, user ) {
				if ( err ) {
					console.log( err );
				}

				if ( !matchId( user.bannedUserIds, event.user.id ) && !matchId( user.coolingUserIds, event.user.id ) && !matchWord( user.bannedWords, text ) ) {

					DefaultUser.findById( result.defaultsId, function( err, defaults ) {
						if ( err ) {
							console.log( err );
						}

						if ( !matchId( defaults.bannedUserIds, event.user.id ) && !matchWord( defaults.bannedWords, text ) ) {
							let following = ( event.user.following == null ) ? false : true;
							let start = 0;
							let end = user.potentialRTs.length - 1;

							while ( start <= end ) {
								let mid = parseInt( ( end + start ) / 2 );

								if ( user.potentialRTs[mid].followers == event.user.followers_count ) {
									break;
								} else if ( user.potentialRTs[mid].followers < event.user.followers_count ) {
									start = mid + 1;
								} else if ( user.potentialRTs[mid].followers > event.user.followers_count ) {
									end = mid - 1;
								}
							}

							user.potentialRTs.splice( start, 0, { id: event.id, userId: event.user.id, followers: event.user.followers_count, followingUser: following } );
							console.log( user );
							user.save();
						}
					} );
				}
			} );
		}
	} );

	result.stream.on( 'error', function( err ) {
		console.log( err );
	} );

	return result;
}

function matchId( list, id ) {
	let start = 0;
	let end = list.length - 1;

	while ( start <= end ) {
		let mid = parseInt( ( end + start ) / 2 );

		if ( list[mid].id ) {
			if ( list[mid].id == id ) {
				return true;
			} else if ( list[mid].id < id ) {
				start = mid + 1;
			} else if ( list[mid].id > id ) {
				end = mid - 1;
			}
		} else {
			if ( list[mid] == id ) {
				return true;
			} else if ( list[mid] < id ) {
				start = mid + 1;
			} else if ( list[mid] > id ) {
				end = mid - 1;
			}
		}
	}

	return false;
}

function matchWord( list, text ) {
	for ( let i = 0; i < list.length; i++ ) {
		if ( text.indexOf( list[i] ) != -1 ) {
			return true;
		}
	}

	return false;
}