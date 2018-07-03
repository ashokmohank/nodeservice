import JobModel from '../model/Job'

export function list(req, res) {
    JobModel.find(function (err, jobAll) {
        if (err) {
            return res.status(500).json({
                message: 'err'
            });
        }
        return res.json(jobAll);
    });
}

export function search(req, res) {
    JobModel.find(function (err, jobAll) {
        if (err) {
            return res.status(500).json({
                message: 'err'
            });
        }
        return res.json(jobAll);
    });
}

export function show(req, res) {
    var id = req.params.id;
    JobModel.findOne({ jobId: id }, function (err, jobData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting JobData'
            });
        }
        if (!jobData) {
            return res.status(404).json({
                message: 'No such JobData'
            });
        }
        return res.json(jobData);
    });
}
export function create(req, res) {
    var jobData = new JobModel({
        jobName: req.body.jobName,
        description: req.body.description,
        experience: req.body.experience,
        designation: req.body.designation,
        salary: req.body.salary,
    });
    jobData.save(function (err, jobsData) {
        if (err) {
            return res.status(500).json({
                message: 'Error saving JobData',
                error: err
            });
        }
        return res.json({
            message: 'saved',
            _id: jobsData._id
        });
    });
}
export function update(req, res) {
    var id = req.params.id;
    JobModel.findOne({ jobId: id }, function (err, jobData) {
        if (err) {
            return res.status(500).json({
                message: 'Error saving jobData',
                error: err
            });
        }
        if (!jobData) {
            return res.status(404).json({
                message: 'No such jobData'
            });
        }
        jobData.jobName = req.body.jobName ? req.body.jobName : jobData.jobName;
        jobData.description = req.body.description ? req.body.description : jobData.description;
        jobData.save(function (err, jobData) {
            if (err) {
                return res.status(500).json({
                    message: 'Error getting JobData.'
                });
            }
            if (!jobData) {
                return res.status(404).json({
                    message: 'No such JobData'
                });
            }
            return res.json(jobData);
        });
    });
}
export function remove(req, res) {
    var id = req.params.id;
    JobModel.findByIdAndRemove(id, function (err, jobData) {
        if (err) {
            return res.status(500).json({
                message: 'Error getting jobData.'
            });
        }
        return res.json(jobData);
    });
}
