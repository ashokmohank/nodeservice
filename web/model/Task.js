import { mongoose, autoIncrement } from './../db/mongoose';
//var mongoose = require('mongoose'),
var 
	Schema = mongoose.Schema,

	StatusSetSchema = new Schema({
		taskName: {
			type: String,
			unique: false,
			required: true
		},
		taskId: {
			type: Number,
			unique: true,
			required: true
		},
		description: {
			type: String,
			required: false
		},
		ownerId: {
			type: String,
			required: false
		},
		statusId: {
			type: Number,
			required: false
		},
		statusName: {
			type: String,
			required: false
		},
		item: {
			type: String,
			required: false
		},
		workflowId : {
			type: Number,
			required: true
		},
		activationDate : {
			type: Date,
			required: true
		},
		createdDate: {
			type: Date, 
			default: Date.now
		},
		workflow: [
			{
				flowId: {	
					type: Number,
					required: true
				},
				fromStatusId: {	
					type: Number,
					required: true
				},
				fromStatusName: {	
					type: String,
					required: true
				},
				toStatusId: {	
					type: Number,
					required: true
				},
				toStatusName: {	
					type: String,
					required: true
				},
				sequence: {	
					type: Number,
					required: true
				},
				assingeeId: {	
					type: String,
					required: true
				},
				reviewerId: {	
					type: String,
					required: false
				},
				description: {	
					type: String,
					required: false
				},
				comments: {	
					type: String,
					required: false
				},
				duedays: {	
					type: Number,
					required: false
				},
				duedate : {
					type: Date,
					required: true
				},
				signoff : {
					type: Boolean,
					required : true
				},
				key : {
					type    : mongoose.Schema.Types.ObjectId,
  					default : mongoose.Types.ObjectId
				}
			}
		]
			
	});
	
	StatusSetSchema.plugin(autoIncrement.plugin, {
    model: 'wf_task_details',
    field: 'taskId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('wf_task_details', StatusSetSchema);
