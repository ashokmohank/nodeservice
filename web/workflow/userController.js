import UserModel from '../model/User'

export function list(req, res) {
    UserModel.find(function (err, statusAll) {
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
    UserModel.findOne({ userId: id }, function (err, userData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting statusData'
            });
        }
        if (!userData) {
            return res.status(404).json({
                message: 'No such statusData'
            });
        }
        return res.json(userData);
    });
}
export function create(req, res) {
    var userData = new UserModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });
    userData.save(function (err, usersData) {
        if (err) {
            return res.status(500).json({
                message: 'Error saving statusData',
                error: err
            });
        }
        return res.json({
            message: 'saved',
            _id: usersData._id
        });
    });
}
export function update(req, res) {
    var id = req.params.id;
    UserModel.findOne({ userId: id }, function (err, userData) {
        if (err) {
            return res.status(500).json({
                message: 'Error saving userData',
                error: err
            });
        }
        if (!userData) {
            return res.status(404).json({
                message: 'No such userData'
            });
        }
        userData.firstName = req.body.firstName ? req.body.firstName : userData.firstName;
        userData.lastName = req.body.lastName ? req.body.lastName : userData.lastName;
        userData.save(function (err, userData) {
            if (err) {
                return res.status(500).json({
                    message: 'Error getting statusData.'
                });
            }
            if (!userData) {
                return res.status(404).json({
                    message: 'No such statusData'
                });
            }
            return res.json(userData);
        });
    });
}
export function remove(req, res) {
    var id = req.params.id;
    UserModel.findByIdAndRemove(id, function (err, userData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting userData.'
            });
        }
        return res.json(userData);
    });
}
