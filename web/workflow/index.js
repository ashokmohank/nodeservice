const workflowDefinition = require('./workflowController')
const statusDefinition = require('./statusController')
const statusSetDefinition = require('./statusSetController')
const flowDefinition = require('./flowController')
const taskDefinition = require('./taskController')
const taskUtilDefinition = require('./taskUtil')
const userDefinition = require('./userController')
const jobDefinition = require('./jobController')
module.exports = {
 workflowDefinition,
 statusDefinition,
 statusSetDefinition,
 flowDefinition,
 taskDefinition,
 taskUtilDefinition,
 userDefinition,
 jobDefinition
}
