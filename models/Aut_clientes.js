var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var aut_clientesSchema = new Schema({
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
    status:{
        type: Schema.Types.Boolean,
        required: true
    },  
    fecha:{
        type: Date,
        required: true
    }
});

const Aut_clientes = mongoose.model('Aut_clientes', aut_clientesSchema);

module.exports = Aut_clientes;