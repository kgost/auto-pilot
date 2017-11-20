var mongoose 	= require( 'mongoose' ),
		Schema 		= mongoose.Schema;

var defaultUserSchema = new Schema({
	bannedWords: [String],
	bannedUserIds: [Number]
});

module.exports = mongoose.model( 'DefaultUser', defaultUserSchema );
