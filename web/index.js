//'use strict'
import bodyParser from 'body-parser';
import api from './router'
import  config from'config'
import  express from'express'
import  {workflow, statusDefinition, flowDefinition, taskDefinition} from './workflow';
import Promise from 'promise';

const port = config.get('nodeproject.server.port') || 3000; // set our port



// START THE SERVER
// =============================================================================
const app = express();

app.listen(port);
console.log('Server Started on port ' + port);

// configure app to use bodyParser()
// this will let us get the data from a POST
// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/api/v1', api);
//module.exports = router;

