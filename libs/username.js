var cookie = require('cookie');

var cParser = require("cookie-parser");
// var MongoStore = require('connect-mongo')(session);

var sessionStore = require('../libs/sessionStore');
var User = require('../models/user').User;


function trueUser(str) {
    var cookies = cookie.parse(str); // str = ws.upgradeReq.headers.cookie
    var sid = cParser.signedCookie(cookies["connect.sid"], 'keybord cat');
    // var sUser = 'lol';
    sessionStore.load(sid, function(err, session) {
        var did = new ObjectID(session.user);

        User.findById(did, function(err, user) {
            sUser = user.username;
            console.log('ZZ:' + sUser);
        })
    });
    // return sUser;
}

exports.trueUser = trueUser();