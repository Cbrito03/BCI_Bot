const horario = require('../controllers/validar_horario.js');
const moment_timezone = require('moment-timezone');
const MsjInicial = require('../models/MsjInicial');
const Horarios = require('../models/Horarios');
const BotMensajes = require('../models/BotMensajes.js');
const Config = require('../models/Configuracion');
const Reportes = require('../models/Reporte');
const jquery = require('jquery');
const moment = require('moment');
const axios = require('axios');
const async = require('async');

const xmlParser = require('xml2json');

var clientTimeoutControl = {};

var config = 
{
	validaty : "",
	urlCEDU : "",
	urlSNPV : "",
	url_get_vigencia : "",
	url_update_vigencia : "",
	authorization : '',
	url_EPA : "",
	timer_EPA : ""
}

var configuraciones = {
	get_config : async function()
	{
		const result = await Config.find({"status": true});		

	    if (result.length >= 1)
	    {
	    	for (var i = 0; i < result.length; i++)
	    	{
	    		switch (result[i].titulo)
	    		{
					case 'validaty':
						config.validaty = parseInt(result[i].valor);
					break;
					case 'urlCEDU':
						config.urlCEDU = result[i].valor;
					break;
					case 'urlSNPV':
						config.urlSNPV = result[i].valor;
					break;
					case 'url_EPA':
						config.url_EPA= result[i].valor;
					break;
					case 'timer_EPA':
						config.timer_EPA= result[i].valor;
					break;
					case 'Get_Vigencia':
						config.url_get_vigencia = result[i].valor;
					break;				
					case 'Update_Vigencia':
						config.url_update_vigencia = result[i].valor;
					break;
					case 'Token_Autorización':
						config.authorization = result[i].valor;
					break;				
				}
	    	}
	    }

	    return config;	
    }    
};

var funciones = {	
	validarHorario : async function()
	{
		var result = { status : false };

        const result_hoario = await Horarios.find();

		if (result_hoario.length < 1)  return result;

		const result_msj = await BotMensajes.find({"tipo" : 1});

		if (result_msj.length < 1 && result_msj[0].status == false)  return result.mensaje = "Error al obtener el mensaje";		
	
		result.status = await horario.validarHorario(result_hoario);
		result.action = result_msj[0].action;
		result.messages = result_msj[0].messages;

		return result;
    },
    cargar_msj_incial : async function()
	{
		var obj = {
    		action : "",
    		messages : ""
		};

	    const result = await MsjInicial.find();

	    if (result.length >= 1)
	    {
	    	obj.action = result[0].action;
	    	obj.messages = result[0].messages;
	    }

	    return obj;
    },
    cargar_mensajes: async function()
	{
		var obj = [];

	    const result = await BotMensajes.find({"status": true});

	    if (result.length >= 1)
	    {
	    	var myArr = [1,2,3,4,5];

	    	for (var i = 0; i < result.length; i++)
	    	{
	    		if(myArr.includes(result[i].tipo))
	    		{
	    			obj.push(result[i]);
	    		}	    		
	    	}
	    }

	    return obj;
    },
    cargar_preguntas_rut: async function()
	{
		var obj = "";

	    const result = await BotMensajes.find({"status": true, "tipo" : 5});

	    if (result.length >= 1)
	    {
	    	obj = result[0];	    	
	    }

	    return obj;
    },
    cargar_preguntas_EPA: async function()
	{
		var obj = "";

	    const result = await BotMensajes.find({"status": true, "tipo" : 6});

	    if (result.length >= 1)
	    {
	    	obj = result[0];	    	
	    }

	    return obj;
    },
    cargar_inicio_EPA: async function()
	{
		var obj = "";

	    const result = await BotMensajes.find({"status": true, "tipo" : 10});

	    if (result.length >= 1)
	    {
	    	obj = result[0];	    	
	    }

	    return obj;
    },
    cargar_fin_EPA: async function()
	{
		var obj = "";

	    const result = await BotMensajes.find({"status": true, "tipo" : 7});

	    if (result.length >= 1)
	    {
	    	obj = result[0];	    	
	    }

	    return obj;
    },
    registrar_preguntas_EPA: async function(e)
	{
		const reporte = new Reportes(
	    {
	    	id: e.id,
		    usuario: e.name,
		    horario: e.horario,
			channel: e.channel,
		    respuesta_1: e.pregunta_1,
		    respuesta_2: e.pregunta_2
	    });

	    const result = await reporte.save();

	    console.log("[Controller] :: [registrar_preguntas_EPA] :: " +  result.status);
    },
    cargar_no_cliente: async function()
    {
    	var obj = "";

	    const result = await BotMensajes.find({"status": true, "tipo" : 2});

	    if (result.length >= 1)
	    {
	    	obj = result[0];	    	
	    }

	    return obj;
    },
    cargar_aut_exitoso: async function()
    {
    	var obj = "";

	    const result = await BotMensajes.find({"status": true, "tipo" : 4});

	    if (result.length >= 1)
	    {
	    	obj = result[0];	    	
	    }

	    return obj;
    },
    cargar_aut_errroneo: async function()
    {
    	var obj = "";

	    const result = await BotMensajes.find({"status": true, "tipo" : 3});

	    if (result.length >= 1)
	    {
	    	obj = result[0];	    	
	    }

	    return obj;
    },
    validación_campos_rut: async function(e, valor)
    {
    	var result = false;

    	console.log("validación_campos_rut :: ", e, typeof e)

    	switch (e)
    	{
			case 'rut': // RUT cliente
				if(valor != "")
				{
					if (/^[0-9A-Za-z]+$/.test(valor)) 
					{ 
					    result = true;
					}

					console.log('Entro a RUT ', result);
				}
			break;
			case 'numSerie': // número de serie
				if(valor != "")
				{
					result = true;
				}

				console.log('Entro a número DE SERIE ', result);
			break;	
		}

    	return result;
    },
    preguntas_sinacofi_CEDU: async function(rut, numSerie)
	{	
		var get_config = await configuraciones.get_config();

		var obj = {};	

		var data = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://sinacofi.cl/WebServices">'+
						"<soapenv:Header/>"+
						"<soapenv:Body>"+
							"<web:Consulta>"+
								"<!--Optional:-->"+
								"<web:usuario>WSSOLEM</web:usuario>"+
								"<!--Optional:-->"+
								"<web:claveUsuario>Sina12</web:claveUsuario>"+
								"<!--Optional:-->"+
								"<web:rutCliente>"+rut+"</web:rutCliente>"+
								"<!--Optional:-->"+
								"<web:numeroSerie>"+numSerie+"</web:numeroSerie>"+
								"<!--Optional:-->"+
								"<web:canalInstitucion>00000</web:canalInstitucion>"+
							"</web:Consulta>"+
						"</soapenv:Body>"+
					"</soapenv:Envelope>";		

		var options = {
        	method : 'POST',
			url : config.urlCEDU,
			headers : { 
				'Content-Type':'text/xml;charset=utf-8',
				'SOAPAction': "http://sinacofi.cl/WebServices/Consulta"
			},
			data: data
        };

        var resultado_axios = await axios(options);
        
        if(resultado_axios.status == 200 && resultado_axios.statusText == 'OK')
        {
        	var result_json = JSON.parse(xmlParser.toJson(resultado_axios.data.replace(/soap:/g,"")));

        	var consultaResult = result_json.Envelope.Body.ConsultaResponse.ConsultaResult.codigoRetorno;

        	console.log("[Resultado Cliente] :: [consultaResult] :: [OK] :: " + consultaResult.status);

        	obj.status = true;
        	obj.result = consultaResult
        } 
        else
        {
        	obj.status = false;
        	obj.result = "Erro de WS"
        }        

	    return obj;
    },
    preguntas_sinacofi_SNPV: async function(e, rut)
	{
		var get_config = await configuraciones.get_config();

		var obj = [];

		var data = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://sinacofi.cl/WebServices" xmlns:sdn="http://wsdl.sinacofi.cl/SDN122REQ">'+
						'<soapenv:Header/>'+
						'<soapenv:Body>'+
							'<web:Consulta>'+
								'<!--Optional:-->'+
								'<web:usuario>WSSOLEM</web:usuario>'+
								'<!--Optional:-->'+
								'<web:claveUsuario>Sina12</web:claveUsuario>'+
								'<!--Optional:-->'+
								'<web:rutCliente>'+rut+'</web:rutCliente>'+
								'<!--Optional:-->'+
								'<web:canalInstitucion>00000</web:canalInstitucion>'+
								'<!--Optional:-->'+
								'<web:idChallenge></web:idChallenge>'+
								'<!--Optional:-->'+
								'<web:desafio>'+
									'<!--Zero or more repetitions:-->'+
									'<web:RESPUESTAS>'+
										'<!--Optional:-->'+
										'<sdn:CODIGO_PREGUNTA>'+e.pregunta+'</sdn:CODIGO_PREGUNTA>'+
										'<!--Optional:-->'+
										'<sdn:CODIGO_RESPUESTA>'+e.respuesta+'</sdn:CODIGO_RESPUESTA>'+
									'</web:RESPUESTAS>'+
								'</web:desafio>'+
							'</web:Consulta>'+
						'</soapenv:Body>'+
					'</soapenv:Envelope>';

		var options = {
        	method : 'post',
			url : config.urlSNPV,
			headers : { 'Content-Type': 'text/xml'},
			data: data
        };

        var resultado_axios = await axios(options);
        console.log("[Resultado AXIOS] :: ", resultado_axios);	    

	    return resultado_axios;
    },
    valida_vigencia: async function(num)
    {
    	var get_config = await configuraciones.get_config();

    	console.log("[valida_vigencia] :: [NUM] :: " + num + " - " + typeof num);

    	var resultado = { "authValidity" : false };

    	var data = { "phone": num };		

		var options = {
        	method : 'POST',
			url : config.url_get_vigencia,
			headers : { 
				'Content-Type':'application/json',
				'Authorization': config.authorization
			},
			data: data
        };

        console.log("[valida_vigencia] :: [data - NUM ] :: " + num);

        await axios(options).then(function (response)
        {
		  	if(response.status == 200 && response.statusText == 'OK')
	        {
	        	resultado = response.data;	        	
	        }
		}).catch(function (error)
		{
			console.log("[valida_vigencia] :: [catch] :: [error] :: " + error.response.status);
        	console.log("[valida_vigencia] :: [catch] :: [error] :: " + error.response.data);
        	resultado.authValidity = error.response.data.code;
		});

        console.log("[valida_vigencia] :: [resultado] :: " + resultado.authValidity);

        return resultado;
    },
    update_vigencia: async function(num,rut)
    {
    	var get_config = await configuraciones.get_config();

    	console.log("[update_vigencia] :: [NUM] :: " + num + " :: [RUT] :: " + rut);
    	console.log("[update_vigencia] :: [NUM] :: [Tipo] " + typeof num + " :: [RUT] :: " + typeof rut);

    	var resultado = false;

    	var data = {
    		"idPerson": "bci:"+rut,
		    "phone": num.toString(),
		    "validity": config.validaty
    	};

    	console.log("[update_vigencia] :: [idPerson] :: " + data.idPerson + " :: [phone] :: " + data.phone + " :: [validity] :: " + data.validity);

		var options = {
        	method : 'POST',
			url : config.url_update_vigencia,
			headers : { 
				'Content-Type':'application/json',
				'Authorization': config.authorization
			},
			data: data
        };

        await axios(options).then(function (response)
        {
		  	console.log("[valida_vigencia] :: [response] :: [Status] :: " + response.status + " :: [valida_vigencia] :: " + response.statusText);

		  	if(response.status == 200 && response.statusText == 'OK')
	        {
	        	resultado = true;	        	
	        }
		})
		.catch(function (error)
		{
			console.log("[update_vigencia] :: [error] :: [Code] ::");

        	//resultado = "Code: " +error.response.data.code + " - Description: " + error.response.data.description;

        	resultado = "Code: " + error.toString();
		});

        console.log("[update_vigencia] :: [resultado] :: " + resultado);

        return resultado;
    },
    startClientTimeOut : async function(e,data)
    {
    	console.log("[startClientTimeOut] [EPA Start Timer] [IDCliente] :: " + e);

    	var get_config = await configuraciones.get_config();

    	var msj_fin_EPA = await this.cargar_fin_EPA();

    	var tiempo = Math.floor(parseInt(get_config.timer_EPA) * 60000);

    	console.log("[startClientTimeOut] [EPA Start Timer] [Tiempo] :: " + tiempo);

    	data.systemMessage = "EPA NO RESPONDIDO";
    	data.botNotification = false;
    	data.data["text"] = msj_fin_EPA.messages[0];

    	clientTimeoutControl[e] = {
			dato: data,
			timeOut: ""		  
		};

		console.log("[startClientTimeOut] [EPADatos] :: [data channel] :: " + data.channel);
            console.log("[startClientTimeOut] [EPADatos] :: [data userID] :: " + data.userID);
            console.log("[startClientTimeOut] [EPADatos] :: [data orgID] :: " + data.orgID);
            console.log("[startClientTimeOut] [EPADatos] :: [data data Text :: " + data.data.text);
            console.log("[startClientTimeOut] [EPADatos] :: [data userID] :: " + data.userID);
            console.log("[startClientTimeOut] [EPADatos] :: [get_config.url_EPA] :: " + get_config.url_EPA);
            console.log("[startClientTimeOut] [EPADatos] :: [get_config.authorization] :: " + get_config.authorization);
            console.log("[startClientTimeOut] [EPADatos] :: [persona.telefono] :: " + persona.telefono);

		clientTimeoutControl[e].timeOut = setTimeout( () =>
		{
			console.log("[startClientTimeOut] [Inicia el Timer] [setTimeout] :: " + e);

			var options = {
	            method : 'POST',
	            url : get_config.url_EPA,
	            headers : { 
	              'Content-Type':'application/json',
	              'Authorization': get_config.authorization //"Bearer eyKhbGciOiJIUzdxmklamwkdqwnondqown.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNpeGJlbGwgQ29udmVyc2F0aW9ucyIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjJ9.UIFndsadskacascda_dasda878Cassda_XxsaSllip0__saWEasqwed2341cfSAS"
	            },
	            data: data
	        };

	        axios(options).then(function (response)
			{
				console.log("[startClientTimeOut] [EPAOK] [status] :: " + response.data.status + " :: [EPAMenssage] :: " + response.data.message);
				this.clearClientTimeOut(e);
			})
			.catch(function (error)
			{
				console.log("[startClientTimeOut] [EPAERROR] [status] :: " + resultado.status + " :: [EPAMenssage] :: " + resultado.message);
				this.clearClientTimeOut(e);
			});

			console.log("[startClientTimeOut] [EPATimer] [ID Cliente]  :: " + e); 
		}, tiempo);				
    },
    clearClientTimeOut : async function(keyTimeout)
    {
    	console.log("[clearClientTimeOut] [EPAEClear] [ID Cliente] :: " + keyTimeout);

    	if(clientTimeoutControl && Object.keys(clientTimeoutControl).length > 0)
    	{
    		console.log("[clearClientTimeOut] [EPAEClear] [Existe llave] :: " + clientTimeoutControl.hasOwnProperty(keyTimeout));

    		if(clientTimeoutControl.hasOwnProperty(keyTimeout))
    		{
    			console.log("[clearClientTimeOut] [EPAEClear] [Se detiene el timer y se elimina el objeto] :: " + keyTimeout);
    			
    			clearTimeout(clientTimeoutControl[keyTimeout].timeOut);

    			delete clientTimeoutControl[keyTimeout];
    		}
    	}
    }
}

exports.funciones = funciones;
exports.configuraciones = configuraciones;