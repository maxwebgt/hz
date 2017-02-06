var mongoose = require('mongoose');
var config = require('../config.json'); //MAIN CONFIG!


mongoose.connect(config.mongoose.uri, config.mongoose.options);

module.exports = mongoose;
