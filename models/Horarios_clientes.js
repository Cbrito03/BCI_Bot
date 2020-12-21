var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hoarios_clientesSchema = new Schema({
    id: {
        type: Schema.Types.String,
        required: true
    },
    usuario:{
        type: Schema.Types.String,
        required: true
    },
    channel:{
        type: Schema.Types.String,
        required: false,
        default: "WhatsApp"
    },
    horario:{
        type: Schema.Types.Boolean,
        required: true
    },	
    fecha:{
        type: Date,
        required: true
    }
});

const Horarios_clientes = mongoose.model('Horarios_clientes', hoarios_clientesSchema);

module.exports = Horarios_clientes;