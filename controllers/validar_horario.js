const moment_timezone = require('moment-timezone');
const jquery = require('jquery');
const moment = require('moment');
var fecha_actual = "";

function isValidHour(hour, minute ,close_hour) // Verifica si la hora es valida, entre numeros positivos y menores a 24
{
	//console.log("[Brito] :: [isValidHour] :: [hour] :: " , hour, minute ,close_hour);
	return (hour > -1 && hour < 24 && minute > -1 && minute < 60) && (hour <= close_hour);
}

function validar_rango_hora(hour, OPEN_HOUR, CLOSE_HOUR)
{
	console.log("[Brito] :: [validar_rango_minuto] :: [hour actual] :: "+ hour +" :: [OPEN_HOUR] :: "+ OPEN_HOUR +" :: [CLOSE_HOUR] :: "+ CLOSE_HOUR);
	return hour >= OPEN_HOUR && hour <= CLOSE_HOUR;
}

function validar_rango_minuto(minute, OPEN_MINUTE, CLOSE_MINUTE)
{
	return minute >= OPEN_MINUTE && minute < CLOSE_MINUTE;
}

function validar_rango_hora_inicio(hour, OPEN_HOUR, minute, OPEN_MINUTE)
{
	var result = false;

	if(hour == OPEN_HOUR)
	{
		if(minute >= OPEN_MINUTE)
		{
			result = true;
		}
	}
	else if(hour > OPEN_HOUR)
	{		
		result = true;		
	}
	else if(hour < OPEN_HOUR)
	{
		result = false;
	}

	//console.log("[Brito] :: [validar_rango_hora_inicio] :: [hour actual] :: " + hour + " :: [OPEN_HOUR] :: " + OPEN_HOUR);
	//console.log("[Brito] :: [validar_rango_hora_inicio] :: [Min actual] :: " + minute + " :: [OPEN_MINUTE] :: " + OPEN_MINUTE);
	//console.log("[Brito] :: [validar_rango_hora_inicio] :: [Result] :: " + result);
	return result;
}

function validar_rango_hora_fin(hour, CLOSE_HOUR, minute, CLOSE_MINUTE)
{
	var result = false;

	if(hour == CLOSE_HOUR)
	{
		if(minute < CLOSE_MINUTE)
		{
			result = true;
		}
	}
	else if(hour > CLOSE_HOUR)
	{		
		result = false;		
	}
	else if(hour < CLOSE_HOUR)
	{
		result = true;
	}

	//console.log("[Brito] :: [validar_rango_hora_fin] :: [hour actual] :: " + hour + " :: [CLOSE_HOUR] :: " + CLOSE_HOUR);
	//console.log("[Brito] :: [validar_rango_hora_fin] :: [Min actual] :: " + minute + " :: [CLOSE_MINUTE] :: " + CLOSE_MINUTE);
	//console.log("[Brito] :: [validar_rango_hora_fin] :: [Result] :: " + result);
	return result;
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
		{   // validar_rango_hora(hora, OPEN_HOUR, CLOSE_HOUR)    
			if(validar_rango_hora_inicio(hora, OPEN_HOUR, minuto, OPEN_MINUTE))
			{				
				//validar_rango_minuto(minuto, OPEN_MINUTE, CLOSE_MINUTE)
				if(validar_rango_hora_fin(hora, CLOSE_HOUR, minuto, CLOSE_MINUTE))
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
				console.log('[Brito] :: [validarHorario] :: [Hora False]');
				return false;
			}
		}
		else
		{
			console.log('[Brito] :: [El día no esta habilitado para interacciones.]');
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