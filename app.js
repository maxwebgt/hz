var express = require('express');
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('./libs/mgoose');
var User = require('./models/user').User;

var session = require("express-session");
var bParser = require("body-parser");

var cookie = require('cookie');

var cParser = require("cookie-parser");
// var MongoStore = require('connect-mongo')(session);

var sessionStore = require('./libs/sessionStore');

// var trueUser = require('./libs/username');


var app = express();


app.engine('ejs', require('ejs-locals'));
app.set('view engine', 'ejs');

// app.use(cParser());
app.use(session({
    secret: 'keybord cat',
    cookie: { maxAge: null},
    store: sessionStore,
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(bParser.urlencoded({ extended: false }));
app.use(require('./middleware/loadUser'));

app.use(express.static('public'));


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
//			res.send('<h1>forbidden</h1>');
			res.redirect('/');
		}
	})
});

app.get('/chat', function(req, res) {
    if (req.session.user) {
        res.render('pages/chat', { what: 'best', who: 'me' });

    }
    else {
        res.redirect('/');
    }
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


var WebSocketServer = new require('ws');

// подключенные клиенты
var clients = {};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({
    port: 8081
});




webSocketServer.on('connection', function(ws) {
    var id = Math.random();
    clients[id] = ws;

    var cookies = cookie.parse(ws.upgradeReq.headers.cookie); // str = ws.upgradeReq.headers.cookie
    var sid = cParser.signedCookie(cookies["connect.sid"], 'keybord cat');
    sessionStore.load(sid, function(err, session) {
        var did = new ObjectID(session.user);
        User.findById(did, function(err, user) {

                otvet = {
                	type: 'addonline',
					author: user.username,
                    date: new Date()
                };
                for (var key in clients) {
                    clients[key].send(JSON.stringify(otvet));
                }
        })
    });






    ws.on('message', function(message) {
        var GG = trueUser(ws.upgradeReq.headers.cookie, function(sUser) {
            console.log('i did');
            console.log(sUser);
            // var otvet = {
            //     type: 'addmes',
            //     author: user.username,
            //     text: message,
            //     date: new Date()
            // };
            // for (var key in clients) {
            //     clients[key].send(JSON.stringify(otvet));
            // }


        });
        console.log('/////////GG//////////');
        console.log(GG);
        console.log('/////////GG//////////');

        trueUserPromise(ws.upgradeReq.headers.cookie).then(function (sUser) {
			GGG = sUser;
        })
        // var cookies = cookie.parse(ws.upgradeReq.headers.cookie); // str = ws.upgradeReq.headers.cookie
        // var sid = cParser.signedCookie(cookies["connect.sid"], 'keybord cat');
        // sessionStore.load(sid, function(err, session) {
        //     var did = new ObjectID(session.user);
        //
        // User.findById(did, function(err, user) {
        //         // otvet = {
        //         //     author: user.username,
        //         //     text: message,
        //         //     date: new Date()
        //         // };
        //         otvet = {
        //         	type: 'addmes',
        //             author: user.username,
        //             text: message,
        //             date: new Date()
        //         };
        //         for (var key in clients) {
        //             clients[key].send(JSON.stringify(otvet));
        //         }
        //     });
        // });



    });

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        delete clients[id];
        var cookies = cookie.parse(ws.upgradeReq.headers.cookie); // str = ws.upgradeReq.headers.cookie
        var sid = cParser.signedCookie(cookies["connect.sid"], 'keybord cat');
        sessionStore.load(sid, function(err, session) {
            var did = new ObjectID(session.user);

            User.findById(did, function(err, user) {
                otvet = {
                    type: 'remonline',
                    author: user.username
                };
                for (var key in clients) {
                    clients[key].send(JSON.stringify(otvet));
                }
            });
        });




    });

});


function trueUser(str, callback) {
    var cookies = cookie.parse(str); // str = ws.upgradeReq.headers.cookie
    var sid = cParser.signedCookie(cookies["connect.sid"], 'keybord cat');
    sessionStore.load(sid, function(err, session) {
        var did = new ObjectID(session.user);
        User.findById(did, function(err, user) {
            sUser = user.username;
            // console.log('ZZ:' + sUser);
            callback(sUser);
        })
    })}



// trueUser(str, (sUser) => {
//     sUser // твой юзверь
// })

function trueUserPromise(str){
    return new Promise(function(resolve, reject){
        // reject(new Error("Rejected error"))
        var cookies = cookie.parse(str); // str = ws.upgradeReq.headers.cookie
        var sid = cParser.signedCookie(cookies["connect.sid"], 'keybord cat');
        sessionStore.load(sid, function(err, session) {
            var did = new ObjectID(session.user);
            User.findById(did, function (err, user) {
                sUser = user.username;
                // console.log('ZZ:' + sUser);
                resolve(sUser);
            });
        });
	});
}