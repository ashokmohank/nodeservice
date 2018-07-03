import TaskModel from '../model/Task'
import StatusModel from '../model/Status'
import StatusSetModel from '../model/StatusSet'
import WorkflowModel from '../model/Workflow'
import async from 'async'
import { sendCreateNotifications, sendUpdateNotifications, notifyReminders, notifyOverdues } from "./taskUtil"
import moment from 'moment-timezone'
var ObjectId = require('mongoose').Types.ObjectId
//UTC timezone without time
var today = moment().startOf('day').format()
/*
{
  "taskName": "task One",
  "description": "testings",
  "ownerId": "mohanas",
  "statusId": 1,
  "statusName": "to Do",
  "item": "excel",
  "workflowId": 1,
  "activationDate": "2018-05-10",
  "workflow": [
    {
      "flowId": 1,
      "duedate": "2018-05-10",
      "signoff": false
    }
  ]
}
*/


let checkIfArrayIsUnique = (myArray) => {
    return myArray.length === new Set(myArray).size;
}

let validate_isArray = (arrayValue, callback)=>{
    if (!Array.isArray(arrayValue)){
        return callback("Invalid task Set. Array of flow definition expected");
    }
    return callback(null);
}

let checkIsStatusValid = (inputObject, callback)=>{
  let validations =  StatusModel.count({statusId: inputObject.statusId }, function (err, count){ 
              if(err){
                callback(`Invalid Status for Status Code`);
              }else{
                if (count = 0){
                    callback('No Valid Status Found');
                }
                callback(null);
              }
            })
}

let checkIsWorkflowValid = (inputObject, callback)=>{
  let validations =  WorkflowModel.findOne({workflowId: inputObject.workflowId }, function (err, workflowData){ 
              if(err){
                callback(`Invalid Workflow for workflow Code`);
              }
              StatusSetModel.findOne({statusSetId: workflowData.statusSetId}, (err, statusSetData)=>{
                if(err){
                    callback(`Invalid StatusSet Mapped with Workflow. Check the workflow definition is available`);
                  }

                if(statusSetData == null){
                    callback(`Invalid StatusSet`);
                }else{
                    callback(null, statusSetData.statusSet);
                }
              })
            })
}

let validateTaskSignOff = (taskData , reqObject, workflowValue, callback)=>{
    let currentStatusId = taskData.statusId
    let requestingStatusId = reqObject.body.statusId
    let currentWorkflowValue = taskData.workflow
    let requestingWorkflowValue = reqObject.body.workflow
    
    let requestingSignoffObjects = requestingWorkflowValue.filter(item => item.signoff === true)
    let requestingSignoffFlowIds = new Set(requestingSignoffObjects.map(item => item.flowId))

    let currentSignoffObjects = currentWorkflowValue.filter(item => item.signoff === true)
    let currentSignoffFlowIds = new Set(currentSignoffObjects.map(item => item.flowId))
    //Next progressing status
    let validFlowToObjects = workflowValue.filter(item => item.fromStatusId === currentStatusId)
    let validFlowToStatus = new Set(validFlowToObjects.map(item=>  item.toStatusId))
    let validFlowToIds = new Set(validFlowToObjects.map(item=>  item.flowId))
    //reverting status
    let validFlowBackObjects = workflowValue.filter(item => item.toStatusId === currentStatusId)
    let validFlowBackStatus = new Set(validFlowBackObjects.map(item=>  item.fromStatusId))
    let validFlowBackIds = new Set(validFlowBackObjects.map(item=>  item.flowId))

    //console.log(currentSignoffFlowIds)
    //console.log(requestingSignoffFlowIds)
    //Ignore the validations for the items that are already signed off and being signed off again in the request
    currentSignoffFlowIds.forEach((item)=> {
        requestingSignoffFlowIds.delete(item)
    })
    
    //invalid signoffs check
    //Difference of set for requesting flow ids with signoff and valid flow ids from current statusS
    if( 
        !( ([...requestingSignoffFlowIds].filter(item => !validFlowToIds.has(item)).length == 0) || 
            ([...requestingSignoffFlowIds].filter(item => !validFlowBackIds.has(item)).length == 0))
        ){
            return callback('Invalid Signoffs during in the task flow')
    }
    
    //Status flow check
    if(!(validFlowToStatus.has(requestingStatusId) || validFlowBackStatus.has(requestingStatusId) || currentStatusId === requestingStatusId || requestingStatusId === undefined)){
        return callback('Invalid Flow')
    }else{
        //console.log(validFlowToIds.size)
        //automatic task status update on sign-offs
        let nextStatusFlowObject = workflowValue.filter(item => validFlowToIds.has(item.flowId) && item.signoff )
        let nextStatusFlow = nextStatusFlowObject.length == validFlowToIds.size ? new Set(nextStatusFlowObject.map(item => item.toStatusId)) : null
        let autoToUpdatingStatus = nextStatusFlow === null ? null : nextStatusFlow.values().next().value //pick first status of resulting set, if multiple workflows branch at same level
        //back flow to be created
        let nextStatusFlowBackObject = workflowValue.filter(item => validFlowBackIds.has(item.flowId) && !item.signoff )
        let nextStatusFlowBack = nextStatusFlowBackObject.length <= validFlowBackIds.size ? new Set(nextStatusFlowBackObject.map(item => item.fromStatusId)) : null
        let autoBackUpdatingStatus = nextStatusFlowBack === null ? null : nextStatusFlowBack.values().next().value //pick first status of resulting set, if multiple workflows branch at same level
        //console.log(nextStatusFlowBackObject)
        let autoUpdatingStatus = autoToUpdatingStatus != null ? autoToUpdatingStatus : (autoBackUpdatingStatus != null ? autoBackUpdatingStatus : currentStatusId)
        //let autoUpdatingStatus = autoToUpdatingStatus != null ? autoToUpdatingStatus : (autoBackUpdatingStatus != null ? autoBackUpdatingStatus : null)
        //console.log(autoUpdatingStatus)
        //callback(null, autoUpdatingStatus)
        StatusModel.findOne({statusId:autoUpdatingStatus}, (err, statusData)=>{
            if(err){
                callback("Error getting the Status name")
            }
            callback(null, autoUpdatingStatus, statusData.statusName)
        })
        
    }
}

export function list(req, res) {
    TaskModel.find(function (err, taskDatas) {
        if (err) {
            return res.status(500).json({
                message: 'err'
            });
        }
        return res.json(taskDatas);
    });
}
export function show(req, res) {
    var id = req.params.id;
    TaskModel.findOne({ taskId: id }, function (err, taskData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting taskData!'
            });
        }
        if (!taskData) {
            return res.status(404).json({
                message: 'No such taskData'
            });
        }
        return res.json(taskData);
    });
}
export function create(req, res) {
    /*Validations*/
    let taskFlowValues = req.body.workflow;
    //console.log(taskFlowValues)
    async.waterfall([
        function(callback){
          if(taskFlowValues){
            validate_isArray(taskFlowValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
          }else{
            callback(null)
          }
        },
        function(callback){
            checkIsStatusValid(req.body, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },
        function(callback){
          checkIsWorkflowValid(req.body, (err, statusSet)=>{
                if(err){
                    callback(err)
                }
                let allowedStatusId = statusSet.find(o => o.sequence === 1).statusId
                let allowedStatusName = statusSet.find(o => o.sequence === 1).statusName
                req.body.statusId = allowedStatusId // Automatic status setting on creation
                req.body.statusName = allowedStatusName // Automatic status setting on creation
                if(allowedStatusId === req.body.statusId){
                    callback(null)
                }else{
                    callback('Status Code should be of first in the sequence of Status Set')
                }
            })
        },
        function(callback){
          WorkflowModel.findOne({workflowId: req.body.workflowId }, function (err, workflowData){ 
            if(err){
              callback(`Invalid Status for Status Code`, null);
            }else{
              callback(null, workflowData.toObject().workflow);
            }
          })
        },
        function(workflowValue, callback){
            var date = req.body.activationDate? new Date(req.body.activationDate) :new Date(today)
           
          let flowDetails = []
          let updatePromises ;
          if(workflowValue){
            updatePromises = workflowValue.map((storedItem)=>{
              return new Promise((resolve)=>{
                if(taskFlowValues){
                  taskFlowValues.map((reqItem)=>{
                    if(storedItem.flowId == reqItem.flowId){
                    //Restrict sign-off during creation
                      //storedItem.signoff = reqItem.signoff ? reqItem.signoff : (storedItem.signoff ? storedItem.signoff : false)
                      storedItem.signoff = false
                      storedItem.duedate = reqItem.duedate ? reqItem.duedate : (storedItem.duedate? storedItem.duedate : date.setDate(date.getDate() + storedItem.duedays))
                    }else{
                      //storedItem.signoff = storedItem.signoff ? storedItem.signoff : false
                      storedItem.signoff = false
                      storedItem.duedate = storedItem.duedate ? storedItem.duedate : date.setDate(date.getDate() + storedItem.duedays)
                    }
                  })
                }else{
                  storedItem.signoff = storedItem.signoff ? storedItem.signoff : false
                  storedItem.duedate = storedItem.duedate ? storedItem.duedate : date.setDate(date.getDate() + storedItem.duedays)
                }
                date = req.body.activationDate? new Date(req.body.activationDate) :new Date(today)
                flowDetails.push(storedItem)
              resolve()})
            })
          }
          
          Promise.all(updatePromises).then(()=>{
            //console.log(`out ${flowDetails}`)
            callback(null, workflowValue)})

          }
    ], function(err, workflowValue){
        //console.log(`data ${req.body.taskName}`);
        if(err) {
            return res.status(500).json({
                message: 'Error saving task',
                error: err
            });
        }
        
        /*Data Creation*/
        var TaskData = new TaskModel({
            taskName: req.body.taskName,
            description: req.body.description,
            ownerId : req.body.ownerId,
            statusId : req.body.statusId,
            statusName : req.body.statusName,
            item : req.body.item,
            workflowId : req.body.workflowId,
            activationDate : req.body.activationDate,
            workflow : workflowValue
        })
        TaskData.save(function (err, taskData) {
            if (err) {
                return res.status(500).json({
                    message: 'Error saving taskData',
                    error: err
                });
            }
            sendCreateNotifications(taskData.taskId)
            return res.json({
                message: 'saved',
                _id: taskData._id
            })
        })
       
    })
}
export function update(req, res) {
    //console.log(req.body.workflow)
    var id = req.params.id;
    /*Validations*/
    let taskFlowValues = req.body.workflow;
    async.waterfall([
        function(callback){
          if(taskFlowValues){
            validate_isArray(taskFlowValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
          }else{
            callback(null)
          }
        },
        function(callback){
            checkIsStatusValid(req.body, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },
        function(callback){
            checkIsWorkflowValid(req.body, (err, statusSet)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },
        function(callback){
          TaskModel.findOne({taskId: id }, function (err, workflowData){ 
              //Add sign-off/ status validations
                if(err){
                  callback(`Invalid Status for Status Code`, null);
                }
                if(workflowData == null){
                  callback(`No such task is found`, null);
                }else{
                    callback(null, workflowData.toObject().workflow);
                }
              })
        },
        function(workflowValue, callback){
            
            var date = req.body.activationDate? new Date(req.body.activationDate) :new Date(today)
           
          let flowDetails = []
          let updatePromises ;
          if(workflowValue){
            updatePromises = workflowValue.map((storedItem)=>{
              return new Promise((resolve)=>{
                if(taskFlowValues){
                  taskFlowValues.map((reqItem)=>{
                    if(storedItem.flowId == reqItem.flowId){
                      storedItem.signoff = reqItem.signoff != undefined ? reqItem.signoff : (storedItem.signoff ? storedItem.signoff : false)
                      storedItem.duedate = reqItem.duedate ? reqItem.duedate : (storedItem.duedate? storedItem.duedate : date.setDate(date.getDate() + storedItem.duedays))
                    }else{
                      storedItem.signoff = storedItem.signoff != undefined ? storedItem.signoff : false
                      storedItem.duedate = storedItem.duedate ? storedItem.duedate : date.setDate(date.getDate() + storedItem.duedays)
                    }
                  })
                }else{
                  storedItem.signoff = storedItem.signoff != undefined ? storedItem.signoff : false
                  storedItem.duedate = storedItem.duedate ? storedItem.duedate : date.setDate(date.getDate() + storedItem.duedays)
                }
                date = req.body.activationDate? new Date(req.body.activationDate) :new Date(today)
                flowDetails.push(storedItem)
              resolve()})
            })
          }
          
          Promise.all(updatePromises).then(()=>{
            //console.log(`out ${flowDetails}`)
            callback(null, workflowValue)
        })

          }
    ], function(err, workflowValue){
        TaskModel.findOne({ taskId: id }, function (err, taskData) {
            if (err) {
                return res.status(500).json({
                    message: 'Error saving taskData',
                    error: err
                });
            }
            if (!taskData) {
                return res.status(404).json({
                    message: 'No such taskData'
                });
            }
            validateTaskSignOff(taskData, req, workflowValue, (err, autoUpdatingStatusId, autoUpdatingStatusName)=>{
                if(err){
                    return res.status(500).json({
                        message: err
                    });
                }
                taskData.taskName = req.body.taskName ? req.body.taskName : taskData.taskName;
                taskData.description = req.body.description ? req.body.description : taskData.description;
                taskData.statusSetId = req.body.statusSetId ? req.body.statusSetId : taskData.statusSetId;
                taskData.statusId = autoUpdatingStatusId === null ? taskData.statusId : autoUpdatingStatusId //req.body.statusId ? req.body.statusId : taskData.statusId;
                taskData.statusName = autoUpdatingStatusName === null ? taskData.statusName : autoUpdatingStatusName
                taskData.item = req.body.item ? req.body.item : taskData.item;
                //taskData.workflowId = req.body.workflowId ? req.body.workflowId : taskData.workflowId;
                taskData.activationDate = req.body.activationDate ? req.body.activationDate : taskData.activationDate;
                taskData.workflow = workflowValue; 
                taskData.save(function (err, taskData) {
                    if (err) {
                        return res.status(500).json({
                            err : err,
                            message: 'Error getting taskData of save during update.'
                        });
                    }
                    if (!taskData) {
                        return res.status(404).json({
                            message: 'No such taskData'
                        });
                    }
                    sendUpdateNotifications(taskData.taskId)
                    if(req.method == 'GET'){
                        //for sign-off request with query params function:signoffFlowId
                        return res.send(`
                        <div style="text-align: center; background-color: #4caf50; border: none; color: white; padding: 15px 32px; text-decoration: none; font-size: 16px; margin: 0; position: absolute;  top: 50%; left: 50%;transform: translate(-50%, -50%);  width: 60%;">
                        Sign-Off Completed !</div>

                        <div style="text-align: center; border: none; color: grey; padding: 15px 32px; text-decoration: none; font-size: 10x; margin: 0; position: absolute;  top: 70%; left: 50%;transform: translate(-50%, -10%);  width: 60%;">
                        Powered By DART - Data Automation and Refinement for Transformation, Verizon</div>`)
                    }else{
                        return res.json(taskData)
                    }
                });
            })
        })
    })
}
export function remove(req, res) {
    var id = req.params.id;
    TaskModel.findByIdAndRemove(id, function (err, taskData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting taskData.'
            });
        }
        return res.json(taskData);
    });
    
}

export function signoffFlowId(req, res) {
    let taskId = parseInt(req.query.taskid)
    let flowId = parseInt(req.query.flowid)
    let signoff = req.query.signoff == 'true' ? true : false
    let key = new ObjectId(req.query.key)
    //console.log(`TaskId: ${taskId} flowid: ${flowId} signoff: ${signoff} key: ${key}`)
    TaskModel.findOne({taskId: taskId , "workflow.key":key}, (err, taskData) => {
        if (err) {
            return res.status(500).json({
                message: 'Error getting taskData.'
            });
        }
        if (!taskData) {
            return res.status(404).json({
                message: 'No such taskData'
            });
        }
        req.params.id = taskId
        req.body.workflowId = taskData.workflowId
        var item = {"flowId": flowId, "signoff": signoff}
        var items = taskData.workflow

        var foundIndex = items.findIndex(x => x.flowId == item.flowId);
        items[foundIndex] = item;
        req.body.workflow = items
        //req.body.workflow = [{"flowId": flowId, "signoff": signoff}]
        
        //console.log(req.body.workflow)
        update(req, res)
        
    })
}

export function processNotifications(req, res) {
    var id = req.params.id;
    
    notifyOverdues(id, (err)=>{
        if (err) {
            return res.status(500).json({
                message: `Error on Notifiying Overdues. ${err}`
            });
        }
        notifyReminders(id, (err)=>{
            if (err) {
                return res.status(500).json({
                    message: `Error on Notifiying Reminders. ${err}`
                });
            }
            return res.status(200).json({
                message: 'done'
            });
        })
    })
  
}