import { mongoose, autoIncrement } from './../db/mongoose';
//var mongoose = require('mongoose'),
var 
	Schema = mongoose.Schema,

	JobSchema = new Schema({
		jobName: {
			type: String,
			unique: false,
			required: true
        },
        description: {
			type: String,
			unique: false,
			required: true
		},
        designation: {
			type: String,
			unique: false,
			required: true
		},
        experience: {
			type: Number,
			unique: false,
			required: true
		},
        salary: {
			type: Number,
			unique: false,
			required: true
		},
		jobId: {
			type: Number,
			unique: true,
			required: true
        },
		userIds: [{
			type: Number,
			unique: false,
			required: false
        }],
        tags: [{
			type: String,
			unique: false,
			required: false
		}],
		createdDate: {
			type: Date, 
			default: Date.now
		}
			
	});
	
	JobSchema.plugin(autoIncrement.plugin, {
    model: 'wf_job_details',
    field: 'jobId',
    startAt: 1,
    incrementBy: 1
});
module.exports = mongoose.model('wf_job_details', JobSchema);
