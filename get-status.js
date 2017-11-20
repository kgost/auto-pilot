const client = require( './auth' );

client.get( 'statuses/user_timeline', { screen_name: 'itsastitchus' }, function( err, tweets, res ) {
	if ( err ) {
		console.log( err );
	}

	tweets.forEach( function( tweet ) {
		console.log( tweet.text );
	} );
} );
