import StatusModel from '../model/Status'

export function list(req, res) {
    StatusModel.find(function (err, statusAll) {
        if (err) {
            return res.status(500).json({
                message: 'err'
            });
        }
        return res.json(statusAll);
    });
}
export function show(req, res) {
    var id = req.params.id;
    StatusModel.findOne({ statusId: id }, function (err, statusData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting statusData'
            });
        }
        if (!statusData) {
            return res.status(404).json({
                message: 'No such statusData'
            });
        }
        return res.json(statusData);
    });
}
export function create(req, res) {
    var statusData = new StatusModel({
        statusName: req.body.statusName,
        description: req.body.description
    });
    statusData.save(function (err, statusData) {
        if (err) {
            return res.status(500).json({
                message: 'Error saving statusData',
                error: err
            });
        }
        return res.json({
            message: 'saved',
            _id: statusData._id
        });
    });
}
export function update(req, res) {
    var id = req.params.id;
    StatusModel.findOne({ statusId: id }, function (err, statusData) {
        if (err) {
            return res.status(500).json({
                message: 'Error saving statusData',
                error: err
            });
        }
        if (!statusData) {
            return res.status(404).json({
                message: 'No such statusData'
            });
        }
        statusData.statusName = req.body.statusName ? req.body.statusName : statusData.statusName;
        statusData.description = req.body.description ? req.body.description : statusData.description;
        statusData.save(function (err, statusData) {
            if (err) {
                return res.status(500).json({
                    message: 'Error getting statusData.'
                });
            }
            if (!statusData) {
                return res.status(404).json({
                    message: 'No such statusData'
                });
            }
            return res.json(statusData);
        });
    });
}
export function remove(req, res) {
    var id = req.params.id;
    StatusModel.findByIdAndRemove(id, function (err, statusData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting statusData.'
            });
        }
        return res.json(statusData);
    });
}
export function createStatus(req, res) {
    console.log(req.body);
    StatusModel.findOne({});
    console.log('yes');
    res.json({ 'message': 'called' });
}
export function createStatus1(data, callback) {
    console.log('Inside userService:createUser');
    callback(null, { "message": "1" });
    const StatusModelTmp = new StatusModel(data);
    StatusModel.create;
    /* const StatusModelTmp = new StatusModel(data);
        return new Promise((resolve, reject) => {
        StatusModelTmp.save((err, stateData) => resolve(stateData));
        });
        */
}
