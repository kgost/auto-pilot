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

		const client = new Twitter({
			consumer_key: user.cKey,
			consumer_secret: user.cSecret,
			access_token_key: user.aKey,
			access_token_secret: user.aSecret,
		});

		let track = '';

		for ( let i = 0; i < user.filterTerms.length; i++ ) {
			track += user.filterTerms[i];

			if ( i != user.filterTerms.length - 1 ) {
				track += ',';
			}
		}

		let stream = client.stream( 'statuses/filter', { track: track, tweet_mode: 'extended' } );

		stream.on( 'data', function( event ) {
			User.findById( user._id, function( err, user ) {
				if ( err ) {
					console.log( err );
				}

				DefaultUser.findById( defaultsId, function( err, defaults ) {
					if ( err ) {
						console.log( err );
					}

					console.log( event.extended_tweet.full_text );
						
					if ( event.user && !event.retweeted_status && !event.possibly_sensitive 
						&& event.user.followers_count >= 50000 && event.lang == 'en' 
						&& !matchId( defaults.bannedUserIds, event.user.id ) 
						&& !matchId( user.bannedUserIds, event.user.id ) 
						&& !matchId( user.coolingUserIds, event.user.id )
						&& !matchWord( defaults.bannedWords, event.extended_tweet.full_text )
						&& !matchWord( user.bannedWords, event.extended_tweet.full_text ) ) {
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
			} );
		} );

		stream.on( 'error', function( err ) {
			console.log( err );
		} );

		// async.map( users, function( user, callback ) {
		// 	callback( null, startStream( user, defaults._id ) );
		// }, function( err, results ) {
		// 	if ( err ) {
		// 		console.log( err );
		// 	}

		// 	for ( let i = 0; i < results.length; i++ ) {
		// 		console.log( results[i] );
		// 	}
		// } );

		// for ( let i = 0; i < users.length; i++ ) {
		// 	streams.push( startStream( users[i], defaults._id ) );
		// }
	} );
} );

function startStream( user, defaultsId ) {
	const client = new Twitter({
		consumer_key: user.cKey,
		consumer_secret: user.cSecret,
		access_token_key: user.aKey,
		access_token_secret: user.aSecret,
	});

	let track = '';

	for ( let i = 0; i < user.filterTerms.length; i++ ) {
		track += user.filterTerms[i];

		if ( i != user.filterTerms.length - 1 ) {
			track += ',';
		}
	}

	let stream = client.stream( 'statuses/filter?tweet_mode=extended', { track: track } );

	stream.on( 'data', function( event ) {
		console.log( event );

		User.findById( user._id, function( err, user ) {
			if ( err ) {
				console.log( err );
			}

			DefaultUser.findById( defaultsId, function( err, defaults ) {
				if ( err ) {
					console.log( err );
				}
					
				if ( event.user && !event.retweeted_status && !event.possibly_sensitive 
					&& event.user.followers_count >= 50000 && event.lang == 'en' 
					&& !matchId( defaults.bannedUserIds, event.user.id ) 
					&& !matchId( user.bannedUserIds, event.user.id ) 
					&& !matchId( user.coolingUserIds, event.user.id )
					&& !matchWord( defaults.bannedWords, event.extended_tweet.full_text )
					&& !matchWord( user.bannedWords, event.extended_tweet.full_text ) ) {
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
		} );
	} );

	stream.on( 'error', function( err ) {
		console.log( err );
	} );

	return stream;
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