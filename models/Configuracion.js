var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var configuracionesSchema = new Schema({
    titulo: {
        type: Schema.Types.String,
        required: true
    },
    valor:{
        type: Schema.Types.String,
        required: true
    },
    status: {
        type: Schema.Types.Boolean,
        required: false,
        default: true
    }
});

const Configuraciones = mongoose.model('Configuraciones', configuracionesSchema);

module.exports = Configuraciones;