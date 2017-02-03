var mongoose = require('../libs/mgoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        require: true
    },
    lastonline: {
        type: Date,
        default: Date.now
    }
});
exports.Online= mongoose.model('Online', schema);