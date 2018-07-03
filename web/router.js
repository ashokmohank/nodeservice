'use strict'

import config from 'config';
import express from 'express';
import Promise from 'promise';
import {workflowDefinition, statusDefinition, statusSetDefinition, flowDefinition, taskDefinition, taskUtilDefinition, userDefinition,
jobDefinition} from './workflow';
import db from './db/mongoose';

const port = config.get('nodeproject.server.port') || 3000; // set our port

// =============================================================================
let router = express.Router();

router.get('/test',function (req, res) {
  console.log('works');
  res.json({ message: 'hooray! welcome to our api!' });
});

//router.get('/testa',function (req, res) {
//    workflow.createStatus;
//    res.json({ message: 'ho!' }); 
//    });
//router.route('/testa').get(workflow.createStatus);
router.get('/testb', (req, res) => { 
  statusDefinition.createStatus1( req, (err, response)=>{
    if(err){
      res.statusCode = 500
      res.json({"error":err})
      return;
    }
    res.statusCode = 201
    res.json({response})
    return
  })
});
/*User Definitions*/
router.route('/user/create').post(userDefinition.create);
router.route('/user/find/:id').get(userDefinition.show);
router.route('/user/update/:id').post(userDefinition.update);
router.route('/user/remove/:id').get(userDefinition.remove);
router.route('/user/list').get(userDefinition.list);
/*Job Definitions*/
router.route('/job/create').post(jobDefinition.create);
router.route('/job/find/:id').get(jobDefinition.show);
router.route('/job/update/:id').post(jobDefinition.update);
router.route('/job/remove/:id').get(jobDefinition.remove);
router.route('/job/list').get(jobDefinition.list);
router.route('/job/search').post(jobDefinition.search);
/*Status Definitions*/
router.route('/status/create').post(statusDefinition.create);
router.route('/status/find/:id').get(statusDefinition.show);
router.route('/status/update/:id').post(statusDefinition.update);
router.route('/status/remove/:id').get(statusDefinition.remove);
router.route('/status/list').get(statusDefinition.list);
/*Status Set Definitions*/
router.route('/statusset/create').post(statusSetDefinition.create);
router.route('/statusset/find/:id').get(statusSetDefinition.show);
router.route('/statusset/update/:id').post(statusSetDefinition.update);
router.route('/statusset/remove/:id').get(statusSetDefinition.remove);
router.route('/statusset/list').get(statusSetDefinition.list);
/*Workflow Definitions*/
router.route('/workflow/create').post(workflowDefinition.create);
router.route('/workflow/find/:id').get(workflowDefinition.show);
router.route('/workflow/update/:id').post(workflowDefinition.update);
router.route('/workflow/remove/:id').get(workflowDefinition.remove);
router.route('/workflow/list').get(workflowDefinition.list);
/*Task Definitions*/
router.route('/task/create').post(taskDefinition.create);
router.route('/task/find/:id').get(taskDefinition.show);
router.route('/task/update/:id').post(taskDefinition.update);
router.route('/task/remove/:id').get(taskDefinition.remove);
router.route('/task/list').get(taskDefinition.list);
router.route('/task/signoff').get(taskDefinition.signoffFlowId);
router.route('/task/notifyall').get(taskDefinition.processNotifications);

router.route('/taskutil/sendmail').get(taskUtilDefinition.sendCreateNotification);
module.exports = router;


