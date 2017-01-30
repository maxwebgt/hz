/**
 * Created by Mark on 30.01.2017.
 */
// var mongoose = require('mongoose');
var express = require('express-session');
var MongoStore = require('connect-mongo')(express);

// mongoose.connect('mongodb://localhost:27017/myauth');
// var sessionStore = new MongoStore({mongoose_connection: mongoose.connection});

var sessionStore = new MongoStore({
    host: '127.0.0.1',
    port: '27017',
    db: 'sessions',
    url: 'mongodb://localhost:27017/myauth'
});


module.exports = sessionStore;