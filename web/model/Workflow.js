import { mongoose, autoIncrement } from './../db/mongoose';
//var mongoose = require('mongoose'),
var 
	Schema = mongoose.Schema,

	workflowSchema = new Schema({
		workflowName: {
			type: String,
			unique: false,
			required: true
		},
		workflowId: {
			type: Number,
			unique: true,
			required: true
		},
		description: {
			type: String,
			unique: false,
			required: false
		},
		statusSetId: {
			type: Number,
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
				}
			}
		]
			
	});
	
	workflowSchema.plugin(autoIncrement.plugin, {
    model: 'wf_flow_detail',
    field: 'workflowId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('wf_flow_detail', workflowSchema);
