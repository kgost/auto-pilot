var mongoose 	= require( 'mongoose' ),
		Schema 		= mongoose.Schema;

var userSchema = new Schema({
	name: String,
	id: Number,
	cKey: String,
	cSecret: String,
	aKey: String,
	aSecret: String,
	filterTerms: [String],
	bannedWords: [String],
	bannedUserIds: [Number],
	coolingUserIds: [{
		date: Number,
		id: Number
	}],
	usersTwoDays: [{
		date: Number,
		id: Number,
		count: Number
	}],
	potentialRTs: [{
		id: String,
		userId: Number,
		followers: Number,
		followingUser: Boolean
	}]
});

module.exports = mongoose.model( 'User', userSchema );
