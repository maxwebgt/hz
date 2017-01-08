var mongoose = require('../libs/mgoose'),
	Schema = mongoose.Schema;



var schema = new Schema({
  username: {
    type: String,
    unique: true,
    require: true
  },
  password: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});


exports.User = mongoose.model('User', schema);