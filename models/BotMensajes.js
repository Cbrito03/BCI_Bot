var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var botMensajesSchema = new Schema({
    titulo: {
        type: Schema.Types.String,
        required: true
    },
    action:{
        type : {
            type: Schema.Types.String,
            required: true
        }       
    },
    messages:[{
        type : {
            type: Schema.Types.String,
            required: false,
            default: "text"
        },
        text : {
            type: Schema.Types.String,
            required: true
        }        
    }],
    tipo:{
        type: Schema.Types.Number,
        required: true
    },
	status: {
		type: Schema.Types.Boolean,
		required: false,
        default: true
	}
});

const BotMensajes = mongoose.model('BotMensajes', botMensajesSchema);

module.exports = BotMensajes;