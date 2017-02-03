var mongoose = require('../libs/mgoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        require: true
    },
    text: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});
exports.Message= mongoose.model('Message', schema);