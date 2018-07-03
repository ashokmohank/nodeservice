import { mongoose, autoIncrement } from './../db/mongoose';
//var mongoose = require('mongoose'),
var 
	Schema = mongoose.Schema,

	Status = new Schema({
		statusId: {	
			type: Number,
			required: true
		},
		statusName: {	
			type: String,
			required: true
		},
		description: {	
			type: String,
			required: false
		},
		createdDate: {
			type: Date, 
			default: Date.now
		}
				
	});

Status.plugin(autoIncrement.plugin, {
    model: 'wf_status_detail',
    field: 'statusId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('wf_status_detail', Status);
