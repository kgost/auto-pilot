const Twitter 		= require( 'twitter' ),
			mongoose 		= require( 'mongoose' ),
			async				= require( 'async' ),
			User				= require( '../models/user' ),
			DefaultUser	= require( '../models/defaultUser' );

mongoose.connect( 'mongodb://localhost/auto_pilot' );

User.find( {}, function( err, users ) {
	if ( err ) {
		throw err;
	}

	async.map( users, function( user, callback ) {
		user.potentialRTs = [];

		for ( let i = 0; i < user.usersTwoDays.length; i++ ) {
			if ( ( Number ) ( new Date() ) - user.usersTwoDays[i].date >= 172800000 ) {
				user.usersTwoDays.splice( i, 1 );
				i--;
			} else if ( user.usersTwoDays[i].count > 2 ) {
				let start = 0;
				let end = user.coolingUserIds.length - 1;

				while ( start <= end ) {
					let mid = parseInt( ( end + start ) / 2 );

					if ( user.coolingUserIds[mid].id == user.usersTwoDays[i].id ) {
						start = mid;
						break;
					} else if ( user.coolingUserIds[mid].id < user.usersTwoDays[i].id ) {
						start = mid + 1;
					} else if ( user.coolingUserIds[mid].id > user.usersTwoDays[i].id ) {
						end = mid - 1;
					}
				}

				user.coolingUserIds.splice( start, 0, { date: ( Number ) ( new Date() ), id: user.usersTwoDays[i].id } );
				user.usersTwoDays.splice( i, 1 );
				i--;
			}
		}

		for ( let i = 0; i < user.coolingUserIds.length; i++ ) {
			if ( ( Number ) ( new Date() ) - user.coolingUserIds[i].date >= 172800000 ) {
				user.usersTwoDays.splice( i, 1 );
				i--;
			}
		}

		user.save( function( err ) {
			callback( err );
		} );
	}, function( err, results ) {
		if ( err ) {
			console.log( err );
		}

		process.exit();
	} );
} );
