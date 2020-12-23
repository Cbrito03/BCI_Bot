const local_storage = require('../controllers/local_storage.js');
const horario = require('../controllers/validar_horario.js');
const moment_timezone = require('moment-timezone');
const MsjInicial = require('../models/MsjInicial');
const Horarios = require('../models/Horarios');
const BotMensajes = require('../models/BotMensajes.js');
const localStorage = require('localStorage');
const Config = require('../models/Configuracion');
const Reportes = require('../models/Reporte');
const Horarios_clientes = require('../models/Horarios_clientes');
const Intentos_clientes = require('../models/Intentos_clientes');
const Aut_clientes = require('../models/Aut_clientes');
const jquery = require('jquery');
const moment = require('moment');
const axios = require('axios');
const async = require('async');

const xmlParser = require('xml2json');

var clientTimeoutControl = {};

var clientTimeoutControl_Aut = {};

var config = 
{
	validaty : "",
	urlCEDU : "",
	urlSNPV : "",
	url_get_vigencia : "",
	url_update_vigencia : "",
	authorization : '',
	url_EPA : "",
	timer_EPA : "",
	url_solem : "",
	cliente_solem : "",
	token_session : "",
	url_get_persona : "",
	url_update_persona : ""
}

var token = {
	"session" : ""
};

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
						config.url_EPA = result[i].valor;
					break;
					case 'timer_EPA':
						config.timer_EPA = result[i].valor;
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
					case 'url_solem':
						config.url_solem = result[i].valor;
					break;
					case 'cliente_solem':
						config.cliente_solem = result[i].valor;
					break;
					case 'token_session':
						config.token_session = result[i].valor;
					break;
					case 'get_persona':
						config.url_get_persona = result[i].valor;
					break;
					case 'update_persona':
						config.url_update_persona = result[i].valor;
					break;		
				}
	    	}
	    }

	    return config;	
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

    			localStorage.removeItem("preguntas_EPA_"+keyTimeout);
      			localStorage.removeItem("guardar_EPA_"+keyTimeout);
      			localStorage.removeItem("NOTIFICATION"+keyTimeout)

    			delete clientTimeoutControl[keyTimeout];
    		}
    	}
    },
    clearClientTimeOut_Aut : async function(id,user, bandera = false)
    {
    	console.log("[clearClientTimeOut_Aut] [Clear] [ID Cliente] :: ", id, " :: Bandera :: ", bandera);

    	if(bandera)
    	{
    		console.log("[clearClientTimeOut_Aut] [Clear] [Se detiene el timer y se elimina el objeto] :: ", bandera);
    		clearTimeout(clientTimeoutControl_Aut[id].timeOut);
    		delete clientTimeoutControl_Aut[id];
	    }
	    else
	    {	    	
	    	if(clientTimeoutControl_Aut && Object.keys(clientTimeoutControl_Aut).length > 0)
	    	{
	    		console.log("[clearClientTimeOut_Aut] [Clear] [Existe llave] :: " + clientTimeoutControl_Aut.hasOwnProperty(id));

	    		if(clientTimeoutControl_Aut.hasOwnProperty(id))
	    		{
	    			console.log("[clearClientTimeOut_Aut] [Clear] [Se detiene el timer y se elimina el objeto] :: " + id);
	    			
	    			clearTimeout(clientTimeoutControl_Aut[id].timeOut);

	    			localStorage.removeItem("bot_bci_"+id);
					localStorage.removeItem("pregunta_rut"+id);
					localStorage.removeItem("valida_vigencia"+id);
					localStorage.removeItem("valida_vigencia_phone"+id)
					localStorage.removeItem("intento"+id);
					localStorage.removeItem("preguntas_EPA_"+user.id);
					localStorage.removeItem("guardar_EPA_"+user.id);
					localStorage.removeItem("intento_EPA"+id);
					localStorage.removeItem("NOTIFICATION"+user.id);

					funciones.registrar_aut_clientes(user);

	    			delete clientTimeoutControl_Aut[id];
	    		}
	    	}
	    }
    }
};

var texto = {
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
	cargar_ya_registrado: async function()
    {
    	var obj = "";

	    const result = await BotMensajes.find({"status": true, "tipo" : 13});

	    if (result.length >= 1)
	    {
	    	obj = result[0];	    	
	    }

	    return obj;
    }
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
    registrar_preguntas_EPA: async function(e)
	{
		var now = moment();
    	now = now.tz("America/Santiago").format("YYYY-MM-DD HH:mm:ss");
		now = moment(now).subtract(6, 'hours');
  		now = moment(now).format("YYYY-MM-DD HH:mm:ss");

    	console.log("[Controller] :: [registrar_preguntas_EPA] :: " + now);

		const reporte = new Reportes(
	    {
	    	id: e.id,
	    	conversationId : e.conversationId,
		    usuario: e.name,
		    horario: e.horario,
			channel: e.channel,
		    respuesta_1: e.pregunta_1,
		    respuesta_2: e.pregunta_2,
		    fecha: now
	    });

	    const result = await reporte.save();

	    console.log("[Controller] :: [registrar_preguntas_EPA] :: " +  result.status);
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
					if (/^[0-9kK]+$/.test(valor)) 
					{
						console.log("[validación_campos_rut] :: " + true);
					    result = true;
					}

					console.log('[validación_campos_rut] :: [Entro a RUT] :: ', result);
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

    	console.log("[valida_vigencia] :: [RUT] :: " + num + " - " + typeof num);

    	var resultado = { "authValidity" : false };

    	var data = { "rut": num.toLowerCase() };
    	//var data = { "phone": num };

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

    	var msj_fin_EPA = await texto.cargar_fin_EPA();

    	var tiempo = Math.floor(parseInt(get_config.timer_EPA) * 60000);

    	console.log("[startClientTimeOut] [EPA Start Timer] [Tiempo] :: " + tiempo);

    	console.log("[startClientTimeOut] [EPA Start Timer] [Data] :: ", data);

    	data.systemMessage = "EPA NO RESPONDIDO";
    	data.botNotification = false;
    	data.data["text"] = msj_fin_EPA.messages[0].text;

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
				configuraciones.clearClientTimeOut(e);
			})
			.catch(function (error)
			{
				console.log("[startClientTimeOut] [EPAERROR] [status] :: ", error);
				configuraciones.clearClientTimeOut(e);
			});

			console.log("[startClientTimeOut] [EPATimer] [ID Cliente]  :: " + e); 
		}, tiempo);				
    },
    registrar_horarios_clientes: async function(e)
	{
		var now = moment();
    	now = now.tz("America/Santiago").format("YYYY-MM-DD HH:mm:ss");
		now = moment(now).subtract(6, 'hours');
  		now = moment(now).format("YYYY-MM-DD HH:mm:ss");

    	console.log("[Controller] :: [Horarios_clientes] :: " + now);

		const h_clientes = new Horarios_clientes(
	    {
	    	id: e.id,
		    usuario: e.name,
		    horario: e.horario,
			channel: e.channel,
		    fecha: now
	    });

	    const result = await h_clientes.save();

	    console.log("[Controller] :: [Horarios_clientes] :: " +  result);
    },
    registrar_intentos_clientes: async function(e)
	{
		var now = moment();
    	now = now.tz("America/Santiago").format("YYYY-MM-DD HH:mm:ss");
		now = moment(now).subtract(6, 'hours');
  		now = moment(now).format("YYYY-MM-DD HH:mm:ss");

		const i_clientes = new Intentos_clientes(
	    {
	    	id: e.id,
		    usuario: e.name,
		    intento: e.intento,
			channel: e.channel,
		    fecha: now
	    });

	    const result = await i_clientes.save();

	    console.log("[Controller] :: [Intentos_clientes] :: " +  result.status);
    },
    registrar_aut_clientes: async function(e)
	{
		var now = moment();
    	now = now.tz("America/Santiago").format("YYYY-MM-DD HH:mm:ss");
		now = moment(now).subtract(6, 'hours');
  		now = moment(now).format("YYYY-MM-DD HH:mm:ss");

		const aut_clientes = new Aut_clientes(
	    {
	    	id: e.id,
		    usuario: e.name,
		    status: e.status,
			channel: e.channel,
		    fecha: now
	    });

	    const result = await aut_clientes.save();

	    console.log("[Controller] :: [registrar_aut_clientes] :: " +  result.status);
    },
    validar_cliente_solem: async function(rut, numSerie)
	{
		var now = moment();
    	now = now.tz("America/Santiago").format("yyyy-MM-DDTHH:mm:ss.SSS");

    	var get_config = await configuraciones.get_config();
		
		var cliente = JSON.parse(get_config.cliente_solem.replace(/'/g,'"'));

		var obj = {};	

		var data = {
			"code": "USER",
		    "type": "START",
		    "subtype": "SESSION",
		    "createdAt": now.toString(),
		    "client": cliente
		};

		const https = require('https');

		const agent = new https.Agent({
		    rejectUnauthorized: false,
		});

		var options = {
        	method : 'POST',
        	strictSSL: false,
        	 httpsAgent: agent,
			url : config.url_solem + "session",
			headers : { 
				'Content-Type' : 'application/json',
				'X-Auth-Token' : get_config.token_session
			},
			data: data
        };

        var result_axios = {};

        await axios(options).then(function (response)
        {
		  	result_axios = response;

		  	console.log("[controller] :: [funciones] :: [validar_cliente_solem] : [OK GET] :: [response] :: ", response.data);        
		}).catch(function (error)
		{
        	console.log("[controller] :: [funciones] :: [validar_cliente_solem] : [catch GET] :: [error] :: ", error);
        	
        	obj.code = error.response.data.code;	
		});

		if(result_axios.status == 200)
        {
        	if(result_axios.data.status.status.code == 200 && result_axios.data.status.status.message == "OK")
        	{
        		var datos = {
					"code": "DOCUMENT",
				    "type": "VALIDATE",
				    "subtype": "EXPIRY",
				    "createdAt": result_axios.data.createdAt,
				   	"client": {
				        'companyId': result_axios.data.client.companyId,
				        'username': result_axios.data.client.username				        
				    },
				    "data": {
				        "digitalIdentity": {
				            "identityDocuments": [{
				                    "countryCode": "CL",
				                    "type": "ID",
				                    "personalNumber": rut,
				                    "number": numSerie
				            }]
				        }
				    }
				};

				console.log("[controller] :: [funciones] :: [validar_cliente_solem GET] :: [Data] :: ", data);

				var optiones = {
		        	method : 'POST',
		        	strictSSL: false,
		        	 httpsAgent: agent,
					url : config.url_solem + "document/validate",
					headers : { 
						'Content-Type' : 'application/json',
						'X-Auth-Token' : get_config.token_session,
						'X-Session-Token' : result_axios.data.client.token
					},
					data: datos
		        };

		        await axios(optiones).then(function (response)
		        {
		        	console.log("[controller] :: [funciones] :: [validar_cliente_solem GET] : [then] :: [RUT] ::", rut, " :: [NUM] ::", numSerie);
		        	console.log("[controller] :: [funciones] :: [validar_cliente_solem GET] : [then] :: [response.status] :: ", response.status);
		        	console.log("[controller] :: [funciones] :: [validar_cliente_solem GET] : [then] :: [response.data.status] :: ", response.data.status);

		        	if(response.status == 200)
					{
						var status_doc = response.data.data.digitalIdentity.identityDocuments[0].statusDocument;
						
						console.log("[controller] :: [funciones] :: [validar_cliente_solem GET] : [200] :: [status_doc] :: ", status_doc);
						
						if(status_doc == "VERIFICACION_OK")
						{
							obj.code = response.data.status.status.code;
							obj.status = true;
						}
						else if(status_doc == "NO_VERIFICADO")
						{
							obj.code = response.data.status.status.code;
							obj.status = true;
						}						
					}
					else
					{
						obj.code = 400;
						obj.status = false;
						console.log("[controller] :: [funciones] :: [validar_cliente_solem GET] : [then ELSE] :: [response] :: ", response);
					}
				}).catch(function (error)
				{
					//console.log("[controller] :: [funciones] :: [validar_cliente_solem GET] : [catch] :: [error] :: ", error);
					console.log("[controller] :: [funciones] :: [validar_cliente_solem GET] : [catch] :: [error] :: ", error);
		        	obj.code = 400;
		        	obj.status = false;
				});
		    }
		    else
		    {
		    	obj.code = 400;
		    	obj.status = false;
		    }
        }
        else
        {
        	obj.code = 400;
        	obj.status = false;
        }

	    return obj;
    },
    valida_respuesta_EPA: async function(valor)
    {
    	var result = false;    	

    	valor = valor.trim();

    	console.log("[controller] :: [valida_respuesta_EPA] :: " + valor)

		if(valor != "")
		{
			if (/^[1-5]+$/.test(valor)) 
			{
				console.log("[controller] :: [valida_respuesta_EPA] :: " + true);
			    result = true;
			}
			console.log('[controller] :: [valida_respuesta_EPA] :: ', result);
		}

    	return result;
    },    
    startClientTimeOut_Aut : async function(id,tel)
    {
    	console.log("[startClientTimeOut_Aut] [Aut Start Timer] [IDCliente] :: " + id);

    	var get_config = await configuraciones.get_config();

    	var tiempo = Math.floor(parseInt(get_config.timer_EPA) * 60000);

    	console.log("[startClientTimeOut_Aut] [EPA Start Timer] [Tiempo] :: " + tiempo);    	

    	clientTimeoutControl_Aut[id] = {
			timeOut: ""		  
		};
		 
		clientTimeoutControl_Aut[id].timeOut = setTimeout( () =>
		{
			console.log("[startClientTimeOut_Aut] [Inicia el Timer] [setTimeout] :: " + id);
			
			configuraciones.clearClientTimeOut_Aut(id, tel);
			
		}, tiempo);				
    }
}

var valid_clie = {
	get_persona: async function(rut,tel)
    {
    	var e = "", canales = "";
    	var get_config = await configuraciones.get_config();

    	console.log("[controller] :: [get_persona] :: [RUT] :: ", rut, " - ", typeof rut);

    	var resultado = { "status_persona" : false };

    	var data = {
    		"codigoEmpresa": "bci",
		    "id": rut.toLowerCase() //"12345678-9"
		};

		console.log("[controller] :: [get_persona] :: [data] :: ", data);	

		var options = {
        	method : 'POST',
			url : config.url_get_persona,
			headers : { 
				'Content-Type':'application/json',
				'Authorization': config.authorization
			},
			data: data
        };

        console.log("[controller] :: [get_persona] :: [options] :: ", options);

        await axios(options).then(function (response)
        {
        	console.log("[controller] :: [get_persona] :: [response] :: ", response);
        	console.log("[controller] :: [get_persona] :: [response.status] :: ", response.status);

		  	if(response.status == 200 && response.statusText == 'OK')
	        {
	        	console.log("[controller] :: [get_persona] :: [Object.keys(response.data).length] :: ", Object.keys(response.data).length);
	        	if (Object.keys(response.data).length > 0)
	        	{
					e = response.data;
	        		canales = response.data.canales;
				}
	        }
		}).catch(function (error)
		{
			console.log("[controller] :: [get_persona] :: [catch] :: [error] :: ", error);
        	resultado.status_persona = "No_Existe";
		});

		if(e != "")
    	{
    		console.log("[controller] :: [get_persona] :: [Hay datos - canales]", canales);

    		for (var i = 0; i < canales.length; i++)
			{
				console.log("[controller] :: [get_persona] :: [canales[i]]", canales[i]);

				if(canales[i].type == "whatsapp")
				{
					console.log("[controller] :: [get_persona] :: [canales[i].type] :: ", canales[i].type);

					var valores = canales[i].values;

					var flag_insert = false;

					for (var j = 0; j < valores.length; j++)
					{
						console.log("[controller] :: [get_persona] :: [valores[j].key] :: ", valores[j].key," :: [valores[j]] :: ", tel);
						
						if(valores[j].key === tel)
						{
							console.log("[controller] :: [get_persona] :: [Existe el telefono]");
							flag_insert = true;
							resultado.status_persona = true;
							break;
						}						
					}

					if(!flag_insert)
					{
						console.log("[controller] :: [get_persona] :: [Numero Nuevo] :: ", tel);

						var data_update = {
							"codigoEmpresa": "bci",
							"persona": {
								"id": e.id,
								"nombres": e.nombres,
								"apellidos": e.apellidos,
								"canales": e.canales,
								"codigoEmpresa": "bci"
							}
						};

						for (var i = 0; i < data_update.persona["canales"].length; i++)
						{
							if(data_update["persona"].canales[i].type == "whatsapp")
							{
								data_update["persona"].canales[i].values.push({"key": tel, "validado": true,});
								console.log("[controller] :: [get_persona] :: [Se agrego array] :: ", data_update["persona"].canales[i].values);
								break;
							}
						}

						console.log("[controller] :: [get_update_persona] :: [data_update] :: ", data_update);
						
						var options_update = {
				        	method : 'POST',
							url : config.url_update_persona,
							headers : { 
								'Content-Type':'application/json',
								'Authorization': config.authorization
							},
							data: data_update
				        };

				        await axios(options_update).then(function (response)
				        {
				        	console.log("[controller] :: [get_update_persona] :: [response ] :: ", response);

						  	if(response.status == 200 && response.statusText == 'OK')
					        {
					        	resultado.status_persona = true;        	
					        }
						}).catch(function (error)
						{
							console.log("[controller] :: [get_update_persona] :: [catch] :: [error] :: ", error);
							console.log("[controller] :: [get_update_persona] :: [catch] :: [error] :: [Code] :: ", error.response.data.code);
							if(error.response.data.code == 99)
							{
								resultado.status_persona = "YA_REGISTRADO";
							}
						});

				        console.log("[controller] :: [update_persona] :: [resultado] :: ", resultado);
				        break;							        
					}							
				}
			} 
    	}
    	else if(e == "")
    	{
    		resultado.status_persona = "No_Existe";
    	}

        console.log("[controller] :: [get_persona] :: [resultado] :: ", resultado.status_persona);

        return resultado.status_persona;
    },
    update_persona: async function(e,key)
    {
    	var get_config = await configuraciones.get_config();

    	console.log("[controller] :: [update_persona] :: [e] :: ", e);

    	console.log("[controller] :: [update_persona] :: [key] :: ", key);

    	var resultado = { "status" : false };

    	var data = {
			"codigoEmpresa": "bci",
			"persona": {
				"id": e.id,
				"nombres": e.nombres,
				"apellidos": e.apellidos,
				"canales": e.canales,
				"codigoEmpresa": "bci"
			}
		};

		for (var i = 0; i < data.persona["canales"].length; i++)
		{
			if(data["persona"].canales[i].type == "whatsapp")
			{
				data["persona"].canales[i].values.push({"key": key, "validado": true,});
				break;
			}
		}		

		var options = {
        	method : 'POST',
			url : config.url_update_persona,
			headers : { 
				'Content-Type':'application/json',
				'Authorization': config.authorization
			},
			data: data
        };

        console.log("[controller] :: [update_persona] :: [data ] :: ", data);

        await axios(options).then(function (response)
        {
        	console.log("[controller] :: [update_persona] :: [response ] :: ", response);

		  	if(response.status == 200 && response.statusText == 'OK')
	        {
	        	resultado = response.data;	        	
	        }
		}).catch(function (error)
		{
			console.log("[controller] :: [update_persona] :: [catch] :: [error] :: " + error.response.status);
        	console.log("[controller] :: [update_persona] :: [catch] :: [error] :: " + error.response.data);
        	resultado.authValidity = error.response.data.code;
		});

        console.log("[controller] :: [update_persona] :: [resultado] :: ", resultado);

        return resultado;
    },
}

exports.configuraciones = configuraciones;
exports.valid_clie = valid_clie;
exports.funciones = funciones;
exports.texto = texto;