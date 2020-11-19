var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var configSchema = new Schema({
    titulo: {
        type: Schema.Types.String,
        required: true
    },
    descripcion:{
        type : {
            type: Schema.Types.String,
            required: true
        }       
    },
    valor:{
        type : {
            type: Schema.Types.String,
            required: true
        }       
    },
	status: {
		type: Schema.Types.Boolean,
		required: false,
        default: true
	}
});

const config = mongoose.model('config', configSchema);

module.exports = config;