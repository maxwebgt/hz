var express = require('express');
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('./libs/mgoose');
var User = require('./models/user').User;
var Mess = require('./models/message').Message;
var Online = require('./models/online').Online;
var session = require("express-session");
var bParser = require("body-parser");
var cookie = require('cookie');
var cParser = require("cookie-parser");
var sessionStore = require('./libs/sessionStore');
var config = require('./config.json'); //MAIN CONFIG!

var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('view engine', 'ejs');

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
        res.render('pages/chat', { port: config.socket.port, host: config.socket.host, method: config.socket.method });

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

    var portapp = process.env.PORT || config.http.port || 3000;
app.listen(portapp, function () {
  console.log('Example app listening on port '+ portapp);
});


var WebSocketServer = new require('ws');


var clients = {};


var webSocketServer = new WebSocketServer.Server({
    port: config.socket.port
});

Online.remove({}, function () {
    console.log('online db empty')
});


webSocketServer.on('connection', function(ws) {
    var id = Math.random();
    clients[id] = ws;
	console.log(id);
      trueUserPromise(ws.upgradeReq.headers.cookie).then(function (sUser) {
///////////////////

          Online.findOne({username: sUser }, function(err, user) {
              if (user) {
              	console.log('user too connect');
              	user.conn += 1;
              	user.save(function (err, updatedTank) {
                    if (err) return handleError(err);
                    console.log('upd conn');
                });
                  Online.find({}, function(err, users) {
                      // console.log('find user: ' + users);
                      clients[id].send(JSON.stringify({
                          type: 'onlineAll',
                          users: users
                      }));
                  });
                  Mess.find({}, function (err, messages) {
                      clients[id].send(JSON.stringify({
                          type: 'messAll',
                          messages: messages
                      }));
                  })
			  }
			  else
			  {
                  var newonline = new mongoose.models.Online({username: sUser, lastonline: new Date()});
                  newonline.save(function(err, newonline ) {
                      if (err) throw err;
                      // console.log(newonline);
                      var otvet = {
                          type: 'addonline',
                          author: sUser,
                          date: new Date()
                      };

                      for (var key in clients) {
                          if (key == id) {
                              Online.find({}, function(err, users) {
                                  // console.log('find user: ' + users);
                                  clients[id].send(JSON.stringify({
                                      type: 'onlineAll',
                                      users: users
                                  }));
                              });
                              Mess.find({}, function (err, messages) {
                                  clients[id].send(JSON.stringify({
                                      type: 'messAll',
                                      messages: messages
                                  }));
                              })
                          }
                          else
                          {
                              clients[key].send(JSON.stringify(otvet));
                          }
                      }
                  });
			  }
          });


///////////////////



    });




    ws.on('message', function(message) {

        trueUserPromise(ws.upgradeReq.headers.cookie).then(function (sUser) {

            if (!message) return;

        	var newmess = new mongoose.models.Message({username: sUser, text: message});
            newmess.save(function(err, newmess) {
                if (err) throw err;
                console.log('new mess: '+ newmess);
                console.log(typeof newmess.created);
                otvet = {
                    type: 'addmes',
                    author: sUser,
                    text: message,
                    date: newmess.created
                };
                for (var key in clients) {
                    clients[key].send(JSON.stringify(otvet));
                }
            });


        	console.log(sUser);
        });







    });

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        delete clients[id];

        trueUserPromise(ws.upgradeReq.headers.cookie).then(function (sUser) {


            Online.findOne({username: sUser}, function(err, user) {
                console.log('find user: ' + user);
                if (user.conn > 1) {
                    user.conn -=1;
                    user.save(function (err) {
                        console.log('-1 gg');

                    })
                }
                else {
                    user.remove(function (err) {

                        console.log('removed');
                    })
                    otvet = {
                        type: 'remonline',
                        author: sUser
                    };
                    for (var key in clients) {
                        clients[key].send(JSON.stringify(otvet));
                    }

                }


            });
            // console.log(sUser);
        });




    });

});


function trueUserPromise(str){
    return new Promise(function(resolve, reject){
        var cookies = cookie.parse(str); // str = ws.upgradeReq.headers.cookie
        var sid = cParser.signedCookie(cookies["connect.sid"], 'keybord cat');
        sessionStore.load(sid, function(err, session) {
            var did = new ObjectID(session.user);
            User.findById(did, function (err, user) {
                if(err) console.log('error');
                resolve(user.username);
            });
        });
	});
}
