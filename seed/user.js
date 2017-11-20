const mongoose 	= require( 'mongoose' ),
			User			= require( '../models/user' );

mongoose.connect( 'mongodb://localhost/auto_pilot' );

let banned = [ 'socialist', 'socialism', 'conservative', 'nazi', 'atheist', 'communist', 'trump', 'disavow', 'demorcrat', 'republican', 'liberal', 'alt', 'moral', 'social fabric', 'white male', 'white people', 'people of color', 'social justice', 'blm', 'black lives matter', 'all lives matter'];

banned.sort( function( a, b ) {
	return a.localeCompare( b );
} );

User.create( { name: 'itsastitchus', cKey: 'PAlu3fhZyNJY6xrqajygBh3FN', cSecret: 'WgHw7PHkFTjBpaCFegzGZHjmRlxB0CfFBB8q9jhnfV8nLEYZns', aKey: '842436675821215744-nujuvDpOBKS9UV5DV16WgKbbrLD5qMm', aSecret: 'UX8fC0UMxuNFBLTPbcqLz2HM219Pv5kMYQ2DdksgFY7vO', filterTerms: ['knit', 'sew', 'fabric', 'handmade', 'diy', 'craft', 'paint', 'garden', 'decor', 'vintage'], bannedWords: banned }, function( err ) {
	if ( err ) {
		throw err;
	}

	process.exit();
} );
