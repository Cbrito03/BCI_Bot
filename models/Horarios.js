var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var horarioSchema = new Schema({
    open_hour: {
        type: Schema.Types.Number,
        required: true
    },
    open_minute:{
        type: Schema.Types.Number,
        required: true
    },
    close_hour:{
        type: Schema.Types.Number,
        required: true
    },
	close_minute:{
		type: Schema.Types.Number,
		required: true
	},
	status: {
		type: Schema.Types.Boolean,
		required: true,
        default: true
	}
});

const Horarios = mongoose.model('Horarios', horarioSchema);

module.exports = Horarios;