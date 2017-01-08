var User = require('./models/user').User;

var mongoose = require('./libs/mgoose');

//var user = new User({
//	username: "Tester2",
//	password: "passworddddds",
//});
//
//
//user.save(function(err, user, affected) {
//	if (err) throw err;
//});


//User.find({username: /.*/}, function(err, tester) {
//	console.log(tester);
//});

mongoose.connection.on('open', function() {
	var db = mongoose.connection.db;
	db.dropDatabase(function(err) {
		if (err) throw err;
		console.log('OK');
		mongoose.disconnect();
	})
});