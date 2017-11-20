const mongoose 	= require( 'mongoose' ),
			User			= require( '../models/user' );

mongoose.connect( 'mongodb://localhost/auto_pilot' );

let banned = [ 'socialist', 'socialism', 'conservative', 'nazi', 'atheist', 'communist', 'trump', 'disavow', 'demorcrat', 'republican', 'liberal', 'alt', 'moral', 'social fabric', 'white male', 'white people', 'people of color', 'social justice', 'blm', 'black lives matter', 'all lives matter'];

banned.sort( function( a, b ) {
	return a.localeCompare( b );
} );

User.create( { name: 'itsastitchus', filterTerms: ['knit', 'sew', 'fabric', 'handmade', 'diy', 'craft', 'paint', 'garden', 'decor', 'vintage'], bannedWords: banned }, function( err ) {
	if ( err ) {
		throw err;
	}

	process.exit();
} );
