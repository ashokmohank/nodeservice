import StatusModel from '../model/Status'
import StatusSetModel from '../model/StatusSet'
import async from 'async'
/*
{
  "statusSetName" : "two",
  "statusSet" : [{
				"statusId": 3,
				"statusName": "To Do",
				"sequence": 1,
				"description": "Testing to do"
            },
        {
				"statusId": 6,
				"statusName": "Done",
				"sequence": 2,
				"description": "Testing Done"
			}]
      }
*/
let checkIfArrayIsUnique = (myArray) => {
    return myArray.length === new Set(myArray).size;
}

let validate_isArray = (arrayValue, callback)=>{
    if (!Array.isArray(arrayValue)){
        return callback("Invalid Status Set. Array of status definition expected");
    }
    console.log(`loop isArray`);
    return callback(null);
}

let validate_sequence = (statusSetValues, callback)=>{
    let sequenceList = [];
    let errFlag = false;
    let valdations = statusSetValues.map((item) => {
            sequenceList.push(item.sequence);
            return StatusModel.count({statusId: item.statusId}, function (err, count){ 
                if(count <= 0){
                    errFlag = true
                    console.log(`Setting errFlag ${errFlag}`)
                }
            });
    })
    
    Promise.all(valdations).then(() => {
        console.log(`sequence ${errFlag}`)
        
        if(!checkIfArrayIsUnique(sequenceList)){
            return callback("Invalid Sequence");
        }
        if(errFlag){
            callback(`Invalid Status for Status Code`);
        }else{
            callback(null);
        }
    });
}

export function list(req, res) {
    StatusSetModel.find(function (err, statusSetDatas) {
        if (err) {
            return res.status(500).json({
                message: 'err'
            });
        }
        return res.json(statusSetDatas);
    });
}
export function show(req, res) {
    var id = req.params.id;
    StatusSetModel.findOne({ statusSetId: id }, function (err, statusSetData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting statusSetData!'
            });
        }
        if (!statusSetData) {
            return res.status(404).json({
                message: 'No such statusSetData'
            });
        }
        return res.json(statusSetData);
    });
}
export function create(req, res) {
    /*Validations*/
    let statusSetValues = req.body.statusSet;
    async.waterfall([
        function(callback){
            validate_isArray(statusSetValues, (err)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
            
        },
        function(callback){
            validate_sequence(statusSetValues, (err)=>{
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
                message: 'Error saving statusSetData',
                error: err
            });
        }
        /*Data Creation*/
        var statusSetData = new StatusSetModel({
        statusSetName : req.body.statusSetName,
        description: req.body.description,
        statusSet: req.body.statusSet,
        comments: req.body.comments
        });

        
        statusSetData.save(function(err, statusSetData){
            if(err) {
                return res.status(500).json({
                    message: 'Error saving statusSetData',
                    error: err
                });
            }
            return res.json({
                message: 'saved',
                _id: statusSetData._id
            });
        });
    })
   
     
        
    
}
export function update(req, res) {
    var id = req.params.id;
    let statusSetValues = req.body.statusSet;
   
    validate_isArray(statusSetValues, (err)=>{
        if(err){
            console.log(`${err}`);
            return res.status(500).json({
                message: err
            });
        }
        validate_sequence(statusSetValues, (err)=>{
            if(err){
                console.log(`${err}`);
                return res.status(500).json({
                    message: err
                });
            }
            console.log(`Update ${err}`);
        
            /*Data Update*/
            StatusSetModel.findOne({ statusSetId: id }, function (err, statusSetData) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error saving statusSetData',
                        error: err
                    });
                }
                if (!statusSetData) {
                    return res.status(404).json({
                        message: 'No such statusSetData'
                    });
                }
                statusSetData.statusSetName = req.body.statusSetName ? req.body.statusSetName : statusSetData.statusSetName;
                statusSetData.description = req.body.description ? req.body.description : statusSetData.description;
                statusSetData.statusSet = req.body.statusSet ? req.body.statusSet : statusSetData.statusSet;
                statusSetData.save(function (err, statusSetData) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error getting statusSetData.'
                        });
                    }
                    if (!statusSetData) {
                        return res.status(404).json({
                            message: 'No such statusSetData'
                        });
                    }
                    return res.json(statusSetData);
                });
            });
        });
    });
    
}
export function remove(req, res) {
    var id = req.params.id;
    StatusSetModel.findByIdAndRemove(id, function (err, statusSetData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting statusSetData.'
            });
        }
        return res.json(statusSetData);
    });
}
