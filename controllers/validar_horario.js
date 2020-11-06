const moment_timezone = require('moment-timezone');
const jquery = require('jquery');
const config = require('./config.js');
const moment = require('moment');
var fecha_actual = "";

function isValidHour(hour, minute ,close_hour) // Verifica si la hora es valida, entre numeros positivos y menores a 24
{
	//console.log("[Brito] :: [isValidHour] :: [hour] :: " , hour, minute ,close_hour);
	return (hour > -1 && hour < 24 && minute > -1 && minute < 60) && (hour <= close_hour);
}

function validar_rango_hora(hour, OPEN_HOUR, CLOSE_HOUR)
{
	//console.log("[Brito] :: [Horas] :: [hour >= OPEN_HOUR && hour <= CLOSE_HOUR] :: "+ hour +" :: "+ OPEN_HOUR +" :: "+ hour +" :: "+ CLOSE_HOUR);
	return hour >= OPEN_HOUR && hour <= CLOSE_HOUR;
}

function validar_rango_minuto(minute, OPEN_MINUTE, CLOSE_MINUTE)
{
	//console.log("[Brito] :: [Minutos] :: [minute >= OPEN_MINUTE && minute < CLOSE_MINUTE] :: "+ minute +" :: "+ OPEN_MINUTE +" :: "+ minute +" :: "+ CLOSE_MINUTE);
	return minute >= OPEN_MINUTE && minute < CLOSE_MINUTE;
}

validarHorario = function(dato)
{
	var OPEN_HOUR = 0;
    var OPEN_MINUTE = 0;
    var CLOSE_HOUR = 0;
    var CLOSE_MINUTE = 0;
    var status = false;

	var now = moment();

	fecha_actual = now.tz("America/Santiago").format("YYYY-MM-DD hh:mm:ss");

	//console.log("[Brito] :: [validarHorario] :: [fecha_actual] :: ", fecha_actual);

	var hora = now.tz("America/Santiago").format("H");
	var minuto = now.tz("America/Santiago").format("m");
	var dia = now.tz("America/Santiago").format("d");

    for(var i = 0; i < dato.length; i++)
    { 
    	var datos = JSON.parse(JSON.stringify(dato[i]));    	
    	if(datos.dia === parseInt(dia))
    	{
    		status = datos.status
    		OPEN_HOUR = datos.open_hour;
		    OPEN_MINUTE = datos.open_minute;
		    CLOSE_HOUR = datos.close_hour;
		    CLOSE_MINUTE = datos.close_minute;
    		break;
    	}    	
	}

	if(isValidHour(OPEN_HOUR, OPEN_MINUTE,CLOSE_HOUR) && isValidHour(OPEN_HOUR, CLOSE_MINUTE, CLOSE_HOUR))
	{
		if(status)
		{          
			if(validar_rango_hora(hora, OPEN_HOUR, CLOSE_HOUR))
			{
				if(hora == CLOSE_HOUR)
				{
					if(validar_rango_minuto(minuto, OPEN_MINUTE, CLOSE_MINUTE))
					{
						return true;
					}
					else
					{
						console.log('[Brito] :: [validarHorario] :: [Minuto False]');
						return false;
					}
				}
				else
				{
					console.log('[Brito] :: [validarHorario] :: [Hora true es diferente a la hora fin] :: [Hora del Sistema] :: '+ hora +" :: [CLOSE_HOUR] :: "+ CLOSE_HOUR);
					return true;
				}
			}
			else
			{
				console.log('[Brito] :: [validarHorario] :: [Hora False]');
				return false;
			}
		}
		else
		{
			return false;
		}
	}
	else
	{
		console.log('[Brito] :: [No cumple con los requisitos: Se ingresaron numeros negativos o fuera del rango establecido.]');
		return false;
	}
}

exports.validarHorario = validarHorario;