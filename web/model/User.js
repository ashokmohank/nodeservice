import { mongoose, autoIncrement } from './../db/mongoose';
//var mongoose = require('mongoose'),
var 
	Schema = mongoose.Schema,

	UserSchema = new Schema({
		firstName: {
			type: String,
			unique: false,
			required: true
        },
        lastName: {
			type: String,
			unique: false,
			required: true
		},
		userId: {
			type: Number,
			unique: true,
			required: true
		},
		taskIds: [{
			type: Number,
			unique: false,
			required: false
		}],
		createdDate: {
			type: Date, 
			default: Date.now
		}
			
	});
	
	UserSchema.plugin(autoIncrement.plugin, {
    model: 'wf_user_details',
    field: 'userId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('wf_user_details', UserSchema);
