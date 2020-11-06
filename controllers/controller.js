const horario = require('../controllers/validar_horario.js');
const moment_timezone = require('moment-timezone');
const MsjInicial = require('../models/MsjInicial');
const Horarios = require('../models/Horarios');
const BotMensajes = require('../models/BotMensajes.js');
const botMsj = require('../controllers/botMsj.js');
const jquery = require('jquery');
const moment = require('moment');
const axios = require('axios');
const async = require('async');

const xmlParser = require('xml2json');

var config = 
{
	urlCEDU : "https://www.sinacofi.cl/SinacofiWS_CEDU/CEDU0702.asmx",
	urlSNPV : "https://www.sinacofi.cl/SinacofiWS_SNPV/SNPV1801.asmx?wsdl",
	url_get_vigencia : "https://psservices.qa-puresocial.com/perfiles/getVigencia",
	url_update_vigencia : "https://psservices.qa-puresocial.com/perfiles/updateVigencia",
	authorization : 'Bearer eyKhbGciOiJIUzdxmklamwkdqwnondqown.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNpeGJlbGwgQ29udmVyc2F0aW9ucyIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjJ9.UIFndsadskacascda_dasda878Cassda_XxsaSllip0__saWEasqwed2341cfSAS'
}

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
		var obj = {};

		console.log("[preguntas_sinacofi_CEDU] :: RUT :: ",rut, " :: Serie :: ", numSerie );	

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

        //console.log("[Resultado Cliente] :: ", resultado_axios);
        
        if(resultado_axios.status == 200 && resultado_axios.statusText == 'OK')
        {
        	var result_json = JSON.parse(xmlParser.toJson(resultado_axios.data.replace(/soap:/g,"")));

        	var consultaResult = result_json.Envelope.Body.ConsultaResponse.ConsultaResult.codigoRetorno;

        	console.log("[Resultado Cliente] :: [consultaResult] :: ", consultaResult);

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
    	console.log("[valida_vigencia] :: [NUM] :: ", num);

    	var resultado = false;

    	var data = {
    		 "phone": "56990156951" // num
    	};		

		var options = {
        	method : 'POST',
			url : config.url_get_vigencia,
			headers : { 
				'Content-Type':'application/json',
				'Authorization': config.authorization
			},
			data: data //JSON.stringify({"phone":"56990156951"});
        };

        var resultado_axios = await axios(options);

        if(resultado_axios.status == 200 && resultado_axios.statusText == 'OK')
        {
        	resultado = resultado_axios.data.authValidity
        }

        console.log("[valida_vigencia] :: [resultado] :: ",resultado);

        return resultado;
    },
    update_vigencia: async function(num,rut)
    {
    	console.log("[update_vigencia] :: [NUM] :: ", num," :: [RUT] :: ", rut);

    	var resultado = false;

    	var data = {
    		"idPerson": "bci:18584333-5", //"bci:"+rut,
		    "phone": "56990156951", // num,
		    "validity": 1
    	};		

		var options = {
        	method : 'POST',
			url : config.url_update_vigencia,
			headers : { 
				'Content-Type':'application/json',
				'Authorization': config.authorization
			},
			data: data
        };

        var resultado_axios = await axios(options);

        if(resultado_axios.status == 200 && resultado_axios.statusText == 'OK')
        {
        	resultado = true
        }

        console.log("[valida_vigencia] :: [resultado] :: ",resultado);

        return resultado_axios.authValidity;
    }
}

exports.funciones = funciones;