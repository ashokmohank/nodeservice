var mongoose = require('mongoose');
var config = require('config');
var dbConfig = config.get('nodeproject.dbConfig.url');
var autoIncrement = require('mongoose-auto-increment');

mongoose.connect(dbConfig);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;

var db = mongoose.connection;

autoIncrement.initialize(db);

db.on('error', function (err) {
	console.log('Connection error:', err.message);
});

db.once('open', function callback () {
	console.log("Connected to DB!");
});

module.exports = { mongoose, autoIncrement} ;
