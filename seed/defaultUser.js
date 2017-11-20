const fs 					= require( 'fs' ),
			csv 				= require( 'fast-csv' ),
			mongoose 		= require( 'mongoose' ),
			DefaultUser	= require( '../models/defaultUser' );

mongoose.connect( 'mongodb://localhost/auto_pilot' );

let banned = [];
let stream = fs.createReadStream( "../assets/Terms-to-Block.csv" );

let csvSream = csv()
	.on( 'data', function( data ) {
		if ( data[0] ) {
			banned.push( data[0] );
		}
	} )
	.on( 'end', function() {
		banned.sort( function( a, b ) {
			return a.localeCompare( b );
		} );

		DefaultUser.create( { bannedWords: banned }, function( err ) {
			if ( err ) {
				throw err;
			}

			process.exit();
		} );
	} );

stream.pipe( csvSream );
