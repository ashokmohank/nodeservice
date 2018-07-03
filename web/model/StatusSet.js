import { mongoose, autoIncrement } from './../db/mongoose';
//var mongoose = require('mongoose'),
var 
	Schema = mongoose.Schema,

	StatusSetSchema = new Schema({
		statusSetName: {
			type: String,
			unique: false,
			required: true
		},
		statusSetId: {
			type: Number,
			unique: true,
			required: true
		},
		description: {
			type: String,
			unique: false,
			required: false
		},
		createdDate: {
			type: Date, 
			default: Date.now
		},
		statusSet: [
			{
				statusId: {	
					type: Number,
					required: false
				},
				statusName: {	
					type: String,
					required: true
				},
				sequence: {	
					type: Number,
					required: true
				},
				description: {	
					type: String,
					required: false
				},
				comments: {	
					type: String,
					required: false
				}
			}
		]
			
	});
	
	StatusSetSchema.plugin(autoIncrement.plugin, {
    model: 'wf_status_set_detail',
    field: 'statusSetId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('wf_status_set_detail', StatusSetSchema);
