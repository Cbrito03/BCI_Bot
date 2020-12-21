var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var intentos_clientesSchema = new Schema({
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
        rrequired: false,
        default: "WhatsApp"
    },
    intento:{
        type: Schema.Types.Boolean,
        required: true
    },  
    fecha:{
        type: Date,
        required: true
    }
});

const Intentos_clientes = mongoose.model('Intentos_clientes', intentos_clientesSchema);

module.exports = Intentos_clientes;