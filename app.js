var express = require('express');
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('./libs/mgoose');
var User = require('./models/user').User;

var session = require("express-session");
var bParser = require("body-parser");
var cParser = require("cookie-parser");
var MongoStore = require('connect-mongo')(session);

var app = express();


app.engine('ejs', require('ejs-locals'));
app.set('view engine', 'ejs');

app.use(session({
	secret: 'keybord cat',
	cookie: { maxAge: 60000},
	store: new MongoStore({mongooseConnection: mongoose.connection}),
	    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(bParser.urlencoded({ extended: false }));
app.use(require('./middleware/loadUser'));

app.get('/', function (req, res) {
		if (req.session.user) {
			res.redirect('/auth');
		}
		else {
			res.render('pages/reg', { what: 'best', who: 'me' });
		}
	
});

app.post('/', function (req, res) {
	var user = req.body.username;
	var pass = req.body.password;
	if (user.length > 2 && pass.length > 2) {
			User.find({username: user}, function(err, users) {
			if (err) return next(err);
			if (users.length) {
				console.log('Такой юзер есть');
				res.send('Этот никнейм занят!');
			}
			else {
				var newuser = new mongoose.models.User({username: user, password: pass});
				newuser.save(function(err, newuser) {
					if (err) throw err;
					User.findOne({ username: user}, function(err, user) {
						if (err) throw err;
						if (user) {
							req.session.user = user._id;	
							res.send('success');
						}

	//					res.redirect('/auth');
					})
				});

				
			}
		})	
	} else {
		res.send('Ник или пароль менее 3 символов');
	}
	
});

app.get('/login', function (req, res) {
	if (req.session.user) {
			res.redirect('/auth');
		}
		else {
			res.render('pages/login', { what: 'best', who: 'me' });
		}	
	
	
});

app.post('/login', function (req, res) {

	var user = req.body.username;
	var pass = req.body.password;
	
	User.findOne({username: user}, function(err, user) {
		if (err) throw err;
		if (user) {
			if (user.password === pass) {
				console.log('пароль верный');
				req.session.user = user._id;
				res.send('пароль верный');
				
			}
			else {
				errmessage = 'Пароль не верный';
				res.write(errmessage);
			}
		}
		else {
			errmessage = 'Неправильный логин';
			res.write(errmessage);
		}
		res.end();
	});
});

app.get('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/');
});

app.get('/auth', function(req, res) {
	User.find({}, function(err, users) {
		if (err) throw err;
		
		if (req.user) {
			res.render('pages/auth', {arrayUsers: users});	
		}
		else {
			res.send('<h1>forbidden</h1>');
		}
		
	})
});

app.get('/user/:id', function(req, res, next) {
	try {
		var id = new ObjectID(req.params.id);
		User.findById(id, function(err, user) {
			res.json(user);
		});
	} catch (e) {
		res.send('User not found');
	}	
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});