var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reporteSchema = new Schema({
    id: {
        type: Schema.Types.String,
        required: true
    },
    conversationId: {
        type: Schema.Types.String,
        required: true
    },
    usuario:{
        type: Schema.Types.String,
        required: true
    },
    horario:{
        type: Schema.Types.Boolean,
        required: true
    },
	channel:{
		type: Schema.Types.String,
		required: false,
        default: "WhatsApp"
	},
    respuesta_1:{
        type: Schema.Types.String,
        required: true
    },
    respuesta_2:{
        type: Schema.Types.String,
        required: true
    },  
    fecha:{
        type: Date,
        required: true
    }
});

const Reportes = mongoose.model('Reportes', reporteSchema);

module.exports = Reportes;