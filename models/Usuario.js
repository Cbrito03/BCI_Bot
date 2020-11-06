var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
    usuario: {
        type: Schema.Types.String,
        required: true
    },
    password:{
        type: Schema.Types.String,
        required: true
    },
    nombre:{
        type: Schema.Types.String,
        required: true
    },
	perfil:{
		type: Schema.Types.String,
		required: true
	},
	status: {
		type: Schema.Types.Boolean,
		required: true,
        default: true
	}
});

const Usuarios = mongoose.model('Usuarios', usuarioSchema);

module.exports = Usuarios;