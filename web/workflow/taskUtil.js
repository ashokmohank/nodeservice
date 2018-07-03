import async from 'async'
import StatusModel from '../model/Status'
import TaskModel from '../model/Task'
import WorkflowModel from '../model/Workflow'
import nodemailer from 'nodemailer'
import directTransport from 'nodemailer-direct-transport'
import Email from 'email-templates'
import moment from "moment-timezone"
import path from "path"
//Timezone for IST
var today = new Date(moment().utcOffset("+05:30").startOf('day').format('LL'))
var tomorrow = new Date(moment(today).utcOffset("+05:30").add(1, 'days').format('LL'))

const transport = nodemailer.createTransport(directTransport({
    name: "http://dashboards.ebiz.verizon.com",
    debug: true
    })
)

const email = new Email({
                    message: {
                        from: 'test.PMO@verizon.com'
                        },
                    // uncomment below to send emails in development/test env:
                    //send: true,
                    transport: transport,
                    views: {
                        // directory where email templates reside
                        root : path.resolve('web/workflow/emails')
                        }
                    });

export function send(req, res) {
   
    var transport = nodemailer.createTransport(directTransport({
                        name: "http://dashboards.ebiz.verizon.com",
                        debug: true
                        })
                    )

    /*transport.sendMail({
        from: 'CPMO.test@verizon.com',
        to: 'ashok.mohan@verizon.com',
        subject: 'Message',
        text: 'I hope this message gets delivered!'
    },function(error, response){
        if(error){
            console.log(error);
            return;
        }res.status(200).json({message: response})
    
        
    });
    */
   const email = new Email({
    message: {
      from: 'test.PMO@verizon.com'
    },
    // uncomment below to send emails in development/test env:
    //send: true,
    transport: transport,
    views: {
        // directory where email templates reside
        root : path.resolve('web/workflow/emails')
    }
  });
   
  email
    .send({
      template: 'create_task',
      message: {
        to: 'ashok.mohan@verizon.com'
      },
      locals: {
        name: 'Elon'
      }
    })
    .then(res.status(200).json({message: "sent"}))
    .catch(console.error)
}


export function sendCreateNotification(req, res) {
   
    
  TaskModel.findOne({taskId: 24}, (err, taskData)=> {
    taskData.recipient = 'ashok.mohan@verizon.com'
    email
    .send({
      template: 'create_task',
      message: {
        to: 'ashok.mohan@verizon.com'
      },
      locals: taskData
    })
    .then(res.status(200).json({message: "sent"}))
    .catch(console.error)
  })
  
}

export function sendCreateNotifications(taskId) {
   
  TaskModel.findOne({taskId: taskId}, (err, taskData)=> {
    let assigneeIds = [...new Set(taskData.workflow.map(item => item.assingeeId))]
    assigneeIds.forEach( assigneeMail => {
        taskData.recipient = assigneeMail
        email
        .send({
        template: 'create_task',
        message: {
            to: assigneeMail
        },
        locals: taskData
        })
        .then()
        .catch(console.error)
    })
  })
  
}

export function sendUpdateNotifications(taskId) {
   
    TaskModel.findOne({taskId: taskId}, (err, taskData)=> {
        let workflowValue = taskData.workflow
        let validRecipientObjects =  workflowValue.filter(item => item.signoff === false)
        validRecipientObjects = validRecipientObjects.length === 0 ? workflowValue : validRecipientObjects
        let assigneeIds = [...new Set(validRecipientObjects.map(item => item.assingeeId))]
        console.log(assigneeIds)
        assigneeIds.forEach( assigneeMail => {
            taskData.recipient = assigneeMail
            email
            .send({
            template: 'update_task',
            message: {
                to: assigneeMail
            },
            locals: taskData
            })
            .then()
            .catch(console.error)
        })
    })
    
  }

function sendemail(options, callback) {
   
    var transport = nodemailer.createTransport(directTransport({
                        name: "http://dashboards.ebiz.verizon.com",
                        debug: true
                        })
                    )

    transport.sendMail(options ,function(error, response){
        if(error){
            console.log(error);
            return calback(error)
        }
        console.log("sending mail");
        return callback(null)
    });
}


export function notifyOverdues(options, callback){
    let date = new Date()
    TaskModel.find({ "workflow.signoff" : false, "workflow.duedate": {$lt: today}}, (err, taskData)=>{
        if (!taskData || taskData.length == 0) {
            return callback('No such taskData')
        }
        taskData.forEach((record)=>{
            record.workflow.forEach((wfRecord)=>{
                if(wfRecord.signoff === false && wfRecord.duedate < today){
                    email
                        .send({
                        template: 'overdue_task',
                        message: {
                            to: wfRecord.assingeeId
                        },
                        locals: {
                            taskId: record.taskId,
                            taskName : record.taskName,
                            description : record.description,
                            activationDate : record.activationDate,
                            statusName : record.statusName,
                            flows : wfRecord
                            }
                        })
                        .then()
                        .catch(console.error)
                    /*let options = {
                        from: 'CPMO.test@verizon.com',
                        to: 'ashok.mohan@verizon.com',
                        cc: 'sujadh.sathar1@verizon.com',
                        subject: `Incomplete: Task - ${record.taskName}`,
                        text: `Task : ${record.taskName} that was expected to be complete by ${wfRecord.duedate} is either pending in your queue or yet to be signed-off. Please address. `
                    }
                    sendemail(options, (mailError)=>{
                        if(mailError){
                            console.log("Error in Sending Email")
                        }
                        
                    })
                    */
                }

            })
          
        })
        return callback(null)
    })
}

export function notifyReminders(options, callback){
    let date = new Date(today)
    TaskModel.find({ "workflow.signoff" : false, "workflow.duedate": {$gte: today, $lt: tomorrow}}, (err, taskData)=>{
        if (!taskData || taskData.length == 0) {
            return callback('No such taskData')
        }
        console.log(`${today} and ${tomorrow} , ${date}`)
        taskData.forEach((record)=>{
            record.workflow.forEach((wfRecord)=>{
                if(wfRecord.signoff === false && wfRecord.duedate > today && wfRecord.duedate < tomorrow){
                    email
                        .send({
                        template: 'reminder_task',
                        message: {
                            to: wfRecord.assingeeId,
                            cc: wfRecord.reviewerId
                        },
                        locals: {
                            taskId: record.taskId,
                            taskName : record.taskName,
                            description : record.description,
                            activationDate : record.activationDate,
                            statusName : record.statusName,
                            flows : wfRecord
                            }
                        })
                        .then()
                        .catch(console.error)
                    /*console.log(`${record.taskName}`)
                    let options = {
                        from: 'CPMO.test@verizon.com',
                        to: 'ashok.mohan@verizon.com',
                        subject: `Reminder: Task - ${record.taskName}`,
                        text: `Task : ${record.taskName} that is expected to be complete by Today is either pending in your queue or yet to be signed-off. Please address. `
                    }
                    sendemail(options, (mailError)=>{
                        if(mailError){
                            console.log("Error in Sending Email")
                        }
                    })
                    */
                    
                }

            })
          
        })
        return callback(null)
    })
}