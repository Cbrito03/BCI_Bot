var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var msjInicialSchema = new Schema({
    titulo : {
        type: Schema.Types.String,
        required: true
    },
    action : {
        type : {
            type : Schema.Types.String,
            required : true
        }       
    },
    messages : [{
        type : {
            type: Schema.Types.String,
            required : false,
            default : "text"
        },
        text : {
            type : Schema.Types.String,
            required : false
        }        
    }],
    status : {
        type : Schema.Types.Boolean,
        required : false,
        default : true
    }
});

const MsjInicial = mongoose.model('mensajes_inicales', msjInicialSchema);

module.exports = MsjInicial;