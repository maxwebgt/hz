var mongoose = require('./libs/mgoose');

mongoose.set('debug', true);

var async = require('async');


async.series([
	openmongo,
	dropDatabase,
	requireModels,
	createUsers,
], function(err, results) {
	if (err) throw err;
//	console.log(results);
	mongoose.disconnect();
})


function openmongo(callback) {
	mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
	var db = mongoose.connection.db;
	db.dropDatabase(callback);
}

function requireModels(callback) {
	require('./models/user');
	
	async.each(Object.keys(mongoose.models), function(modelName, callback) {
		mongoose.models[modelName].ensureIndexes(callback);
	}, callback);
}


function createUsers(callback) {	
	
	var users = [
		{username: 'vasya', password: 'vasyapass'},
		{username: 'petya', password: 'petyapass'},
		{username: 'uriy', password: 'uriypass'}
	];
	async.each(users, function(userData, callback) {
		var user = new mongoose.models.User(userData);
		user.save(callback);
	}, callback)
}

