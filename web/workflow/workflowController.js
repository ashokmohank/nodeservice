import WorkflowModel from '../model/Workflow'
import StatusModel from '../model/Status'
import async from 'async'
/*
{
    "workflowName": "firstFlow",
    "description": "Testing first flow",
    "statusSetId": 1,
    "workflow": [
        {
            "flowId": 1,
            "fromStatusId": 3,
            "fromStatusName": 3,
            "toStatusId": 6,
            "toStatusName": 6,
            "sequence": 1,
            "assingeeId": "mohanas",
            "reviewerId": "v687655",
            "description": "complete",
            "comments": "test",
            "duedays": 1
        }
    ]      
}
*/
function checkDuplicateInObject(propertyName, inputArray) {
    var seenDuplicate = false,
        testObject = {};
  
    inputArray.map(function(item) {
      var itemPropertyName = item[propertyName];
      if (itemPropertyName in testObject) {
        testObject[itemPropertyName].duplicate = true;
        item.duplicate = true;
        seenDuplicate = true;
      }
      else {
        testObject[itemPropertyName] = item;
        delete item.duplicate;
      }
    });

    return new Promise((resolve)=>{
        resolve(seenDuplicate)
    })
  }

let checkDuplicateInArrayOfObject = (inputArray, callback) => {
    let keyList = ["fromStatusId", "toStatusId", "sequence", "assingeeId", "reviewerId"];
    let errFlag = true;
    let validations = keyList.map((item) => {
            return checkDuplicateInObject(item, inputArray).then((seenDuplicate)=>
                {
                    if(!seenDuplicate){
                        errFlag = false
                        console.log(`Unique value found ${item} ${seenDuplicate}`)
                    }
                })
    })
    
    Promise.all(validations).then(() => {
        if(errFlag){
            callback(`Duplicate rows`);
        }else{
            callback(null);
        }
    });
}

let checkIfArrayIsUnique = (myArray) => {
    return myArray.length === new Set(myArray).size;
}

let validate_isArray = (arrayValue, callback)=>{
    if (!Array.isArray(arrayValue)){
        return callback("Invalid Workflow Set. Array of flow definition expected");
    }
    console.log(`loop isArray`);
    return callback(null);
}

let checkIsStatusValid = (workflowSetValues, callback)=>{
    let sequenceList = [];
    let errFlag = false;
    let validations = workflowSetValues.map((item) => {
            sequenceList.push(item.flowId);
            return StatusModel.count({statusId: { $in : [item.fromStatusId, item.toStatusId]} }, function (err, count){ 
                if(count != 2){
                    errFlag = true
                    console.log(`Setting errFlag ${errFlag}`)
                }
            });
    })
    
    Promise.all(validations).then(() => {
        if(!checkIfArrayIsUnique(sequenceList)){
            return callback("Invalid Sequence of Flow ID");
        }
        console.log(`sequence ${errFlag}`)
        if(errFlag){
            callback(`Invalid Status for Status Code`);
        }else{
            callback(null);
        }
    });
}

export function list(req, res) {
    WorkflowModel.find(function (err, workflowDatas) {
        if (err) {
            return res.status(500).json({
                message: 'err'
            });
        }
        return res.json(workflowDatas);
    });
}
export function show(req, res) {
    var id = req.params.id;
    WorkflowModel.findOne({ workflowId: id }, function (err, workflowData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting WorkflowData!'
            });
        }
        if (!workflowData) {
            return res.status(404).json({
                message: 'No such WorkflowData'
            });
        }
        return res.json(WorkflowData);
    });
}
export function create(req, res) {
    /*Validations*/
    let workflowValues = req.body.workflow;
    async.waterfall([
        function(callback){
            validate_isArray(workflowValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },
        function(callback){
            checkIsStatusValid(workflowValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },
        function(callback){
            checkDuplicateInArrayOfObject(workflowValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        }
    ], function(err){
        console.log(`data ${err}`);
        if(err) {
            return res.status(500).json({
                message: 'Error saving Workflow',
                error: err
            });
        }
    
        /*Data Creation*/
        var WorkflowData = new WorkflowModel({
            workflowName: req.body.workflowName,
            statusSetId: req.body.statusSetId,
            description: req.body.description,
            workflow: req.body.workflow
        })
        WorkflowData.save(function (err, workflowData) {
            if (err) {
                return res.status(500).json({
                    message: 'Error saving WorkflowData',
                    error: err
                });
            }
            return res.json({
                message: 'saved',
                _id: workflowData._id
            })
        })
       
    })
}
export function update(req, res) {
    //Add logic to restrict update if the workflow is being used
    var id = req.params.id;
    /*Validations*/
    let workflowValues = req.body.workflow;
    async.waterfall([
        function(callback){
            validate_isArray(workflowValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },
        function(callback){
            checkIsStatusValid(workflowValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },
        function(callback){
            checkDuplicateInArrayOfObject(workflowValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        }
    ], function(err){
        WorkflowModel.findOne({ workflowId: id }, function (err, workflowData) {
            if (err) {
                return res.status(500).json({
                    message: 'Error saving WorkflowData',
                    error: err
                });
            }
            if (!workflowData) {
                return res.status(404).json({
                    message: 'No such WorkflowData'
                });
            }
            workflowData.workflowName = req.body.workflowName ? req.body.workflowName : workflowData.workflowName;
            workflowData.description = req.body.description ? req.body.description : workflowData.description;
            workflowData.statusSetId = req.body.statusSetId ? req.body.statusSetId : workflowData.statusSetId;
            workflowData.workflow = req.body.workflow ? req.body.workflow : workflowData.workflow;
            workflowData.save(function (err, workflowData) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error getting WorkflowData.'
                    });
                }
                if (!workflowData) {
                    return res.status(404).json({
                        message: 'No such WorkflowData'
                    });
                }
                return res.json(workflowData);
            });
        });
    })
}
export function remove(req, res) {
    var id = req.params.id;
    WorkflowModel.findByIdAndRemove(id, function (err, workflowData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting WorkflowData.'
            });
        }
        return res.json(workflowData);
    });
}
