const local_storage = require('../controllers/local_storage.js');
const horario = require('../controllers/validar_horario.js');
const moment_timezone = require('moment-timezone');
const controlador = require('../controllers/controller.js');
const Horarios = require('../models/Horarios');
const localStorage = require('localStorage');
const configs = require('../controllers/config.js');
const express = require('express');
const moment = require('moment');
const axios = require('axios');
const async = require('async');

const router = express.Router();

const setStorage = local_storage.setStorage;
const getStorage = local_storage.getStorage;
const removeStorage = local_storage.removeStorage;

router.post('/message', async (req, res) => {

  console.log("[BCI] :: [POST MESSAGE /message] ");
  
  var apiVersion = req.body.apiVersion;
  var conversationID = req.body.conversationId;
  var authToken = req.body.authToken;
  var channel = req.body.channel;
  var user = req.body.user;
  var context = req.body.context;
  var mensaje = req.body.message;

  var config = configs;

  var estatus = 200;

  var valores_rut = {
    "usuario": "",
    "claveUsuario": "",
    "rutCliente": "",
    "numeroSerie": "",
    "canalInstitucion": ""
  }

  var resultado = {
    "context": context,
    "action": {},
    "messages": [],
    "additionalInfo": {
      "key":"RUT",
      "RUT":"1-9",
      "authValidity": ""
    }
  }

  console.log("lastInteractionFinishTime :: " + context.lastInteractionFinishTime);

  var now = moment();
  var fechaStamp = moment(context.lastInteractionFinishTime)/*.subtract(6, 'hours')*/;
  fechaStamp = moment(fechaStamp).format("YYYY-MM-DD HH:mm:ss");
  var fecha_actual = now.tz("America/Santiago").format("YYYY-MM-DD HH:mm:ss");
  var fecha2 = moment(fecha_actual, "YYYY-MM-DD HH:mm:ss");

  console.log("fechaStamp :: " + fechaStamp + " :: fecha Actual :: " + fecha_actual);

  var diff = fecha2.diff(fechaStamp, 'h'); 
  console.log("diff :: " + diff);
  console.log(typeof diff);
  
  var horarios = await controlador.funciones.validarHorario();  

  console.log("[BCI] :: [message] :: [horarios] :: " + horarios.status);

  var msj_inicial = await controlador.funciones.cargar_msj_incial();

  var msj_cliente = await controlador.funciones.cargar_mensajes();

  var msj_no_cliente = await controlador.funciones.cargar_no_cliente();

  var msj_aut_exitosa = await controlador.funciones.cargar_aut_exitoso();

  var msj_aut_erroneo = await controlador.funciones.cargar_aut_errroneo();

  var msj_preguntas_rut = await controlador.funciones.cargar_preguntas_rut();

  var msj_preguntas_EPA = await controlador.funciones.cargar_preguntas_EPA();

  var msj_fin_EPA = await controlador.funciones.cargar_fin_EPA();

  var local_function = {
    no_autenticado : async function()
    {
      console.log("[local_function] :: [no_autenticado]");

      resultado.action = msj_aut_exitosa.action;                    
      resultado.messages.push(msj_aut_exitosa.messages[1]);
      resultado.additionalInfo.authValidity = false;

      localStorage.removeItem("bot_bci_"+conversationID);
      localStorage.removeItem("pregunta_rut"+conversationID);
      localStorage.removeItem("valida_vigencia"+conversationID);
      localStorage.removeItem("intento"+conversationID);
      localStorage.removeItem("preguntas_EPA_"+conversationID);     
    },
    remove_localStorage : async function()
    {
      console.log("[local_function] :: [remove_localStorage]");

      localStorage.removeItem("bot_bci_"+conversationID);
      localStorage.removeItem("pregunta_rut"+conversationID);
      localStorage.removeItem("valida_vigencia"+conversationID);
      localStorage.removeItem("intento"+conversationID);
      localStorage.removeItem("preguntas_EPA_"+conversationID);
    }
  }

  if(apiVersion !== '' && typeof apiVersion !== "undefined") 
  {
    if(authToken !== '' && typeof authToken !== "undefined") 
    {
      if(channel !== '' && typeof channel !== "undefined") 
      {
        if(user !== '' && typeof user !== "undefined") 
        {
          if(context !== '' && typeof context !== "undefined") 
          {
            if(mensaje !== '' && typeof mensaje !== "undefined") 
            {
              mensaje = mensaje.text.trim();              

              if(context.lastInteractionType == "NOTIFICATION" && diff < 24)
              {
                // Aplico Flujo de la EPA (Preguntas que tengo que guardar en una colección)
                console.log("[EPA] :: pregunta_EPA :: ", localStorage.getItem("preguntas_EPA_"+conversationID));
                if(localStorage.getItem("preguntas_EPA_"+conversationID) == null)
                {                  
                  resultado.action = msj_preguntas_EPA.action;
                  resultado.messages.push(msj_preguntas_EPA.messages[1]);

                  localStorage.setItem("preguntas_EPA_"+conversationID, mensaje);
                }
                else
                {
                  resultado.action = msj_fin_EPA.action;
                  resultado.messages.push(msj_fin_EPA.messages[0]);

                  var rest_EPA = {
                    "pregunta_1" : localStorage.getItem("preguntas_EPA_"+conversationID),
                    "pregunta_2" : mensaje,
                    "horario" : horarios.status,
                    "id" : user.id,
                    "name" : user.name,
                    "channel" : context.channel
                  }

                  await controlador.funciones.registrar_preguntas_EPA(rest_EPA);

                  await local_function.remove_localStorage();
                }
              }
              else if(horarios.status)
              {
                if(localStorage.getItem("bot_bci_"+conversationID) == null )
                {
                  var valida_vigencia = await controlador.funciones.valida_vigencia(user.id);

                  localStorage.setItem("valida_vigencia"+conversationID, valida_vigencia.id);

                  console.log("[valida_vigencia] :: " + valida_vigencia.authValidity);

                  if(valida_vigencia.authValidity == true)
                  {
                    console.log("[valida_vigencia] :: [TRUE]");

                    resultado.action = msj_aut_exitosa.action;
                    resultado.action["type"] = "continue"; 
                    resultado.messages.push(msj_aut_exitosa.messages[0]);   
                    resultado.messages[0].text = resultado.messages[0].text.replace("<nombre cliente>", user.name);

                    localStorage.setItem("pregunta_rut"+conversationID, ["transferir", false, valida_vigencia.id]);
                    localStorage.setItem("bot_bci_"+conversationID, "cliente");
                  }
                  else if(valida_vigencia.authValidity === 99)
                  {

                    resultado.action = msj_no_cliente.action;
                    resultado.messages.push(msj_no_cliente.messages[0]);

                    await local_function.remove_localStorage();
                  }  
                  else if(valida_vigencia.authValidity == false)
                  {
                    resultado.action = msj_inicial.action;
                    resultado.messages.push(msj_inicial.messages[0]);

                    localStorage.setItem("bot_bci_"+conversationID, "cliente");
                    localStorage.setItem("pregunta_rut"+conversationID, ["rut",false]);                    
                  }                  
                }

                if(localStorage.getItem("bot_bci_"+conversationID) !== null)
                {
                  var pregunta_rut = localStorage.getItem("pregunta_rut"+conversationID).split(",");

                  console.log("pregunta_rut :: " + pregunta_rut);

                  if(pregunta_rut[0] == "rut" && pregunta_rut[1] == "false" )
                  {                    
                    resultado.action = msj_preguntas_rut.action;
                    resultado.action.saveHistory = false;
                    resultado.messages.push(msj_preguntas_rut.messages[0]);

                    localStorage.setItem("pregunta_rut"+conversationID, ["rut",true]); 
                  }
                  else if(pregunta_rut[0] == "rut" && pregunta_rut[1] == "true" )
                  {
                    var bandera_vali = await controlador.funciones.validación_campos_rut(pregunta_rut[0], mensaje);
                    var rut_vigencia =  localStorage.getItem("valida_vigencia"+conversationID);

                    console.log("[Cliente ingreso RUT] :: ", rut_vigencia.replace(/-/g,""), mensaje);

                    if(bandera_vali)
                    {
                      if(rut_vigencia.replace(/-/g,"") == mensaje)
                      {
                        var  respuesta_rut = localStorage.getItem("respuesta_rut"+conversationID);

                        if(respuesta_rut == null)
                        {
                          localStorage.setItem("respuesta_rut"+conversationID, mensaje); 
                        }

                        resultado.action = msj_preguntas_rut.action;
                        resultado.action.saveHistory = false;
                        resultado.messages.push(msj_preguntas_rut.messages[1]);

                        localStorage.setItem("pregunta_rut"+conversationID, ["numSerie",true]);
                      }
                      else // Cliente no autenticado
                      {
                        await local_function.no_autenticado();
                      }                      
                    }
                    else
                    {
                      resultado.action = msj_preguntas_rut.action;
                      resultado.action.saveHistory = false;
                      resultado.messages.push(msj_preguntas_rut.messages[0]);
                    }                      
                  }

                  if(pregunta_rut[0] == "numSerie" && pregunta_rut[1] == "true" )
                  {
                    var bandera_vali = await controlador.funciones.validación_campos_rut(pregunta_rut[0], mensaje);
                    
                    if(bandera_vali)
                    {
                      var respuesta_rut = localStorage.getItem("respuesta_rut"+conversationID);

                      var axios_CEDU = await controlador.funciones.preguntas_sinacofi_CEDU(respuesta_rut, mensaje);

                      if(axios_CEDU.status)
                      {
                        if(axios_CEDU.result == "10000")
                        {                         
                          resultado.action = msj_aut_exitosa.action;
                          resultado.action["type"] = "continue";
                          resultado.action.saveHistory = false;
                          resultado.messages.push(msj_aut_exitosa.messages[0]);   
                          resultado.messages[0].text = resultado.messages[0].text.replace("<nombre cliente>", user.name);

                          localStorage.setItem("pregunta_rut"+conversationID, ["transferir",true]);

                          var rut_vigencia =  localStorage.getItem("valida_vigencia"+conversationID);

                          var update_vigencia = await controlador.funciones.update_vigencia(user.id, rut_vigencia);
                        }
                        else
                        {
                          var num_intentos = localStorage.getItem("intento"+conversationID);

                          if(num_intentos == null)
                          {
                            num_intentos = 0;
                          }

                          num_intentos = parseInt(num_intentos) + 1;

                          console.log("Numero de intentos :::::::: " + num_intentos);

                          console.log("Resultado de CEDU :::::::: " + axios_CEDU.result);

                          if((axios_CEDU.result == "10001" || axios_CEDU.result == "10005" || axios_CEDU.result == "10008") &&  parseInt(num_intentos) <= 1 )
                          {                            
                            resultado.action = msj_aut_erroneo.action;

                            for (var i = 0; i < msj_aut_erroneo.messages.length; i++)
                            {
                              resultado.messages.push(msj_aut_erroneo.messages[i]);
                            }

                            localStorage.setItem("intento"+conversationID, num_intentos);
                            localStorage.setItem("pregunta_rut"+conversationID, ["intentar", true])
                          }
                          else // cambiar valor a  no autenticado en el contexto
                          {
                            await local_function.no_autenticado();
                          }
                        }
                      }
                      else // cambiar valor a  no autenticado en el contexto
                      {
                        await local_function.no_autenticado();
                      }                      
                    }
                    else
                    {
                      resultado.action = msj_preguntas_rut.action;
                      resultado.action.saveHistory = false;
                      resultado.messages.push(msj_preguntas_rut.messages[1]);
                    }                                     
                  }

                  if(pregunta_rut[0] === "transferir" && pregunta_rut[2] !== "")
                  {
                    if(pregunta_rut[1] == "true") // Viene autenticado
                    {
                      resultado.action = msj_aut_exitosa.action;
                      resultado.messages.push(msj_aut_exitosa.messages[1]);
                      resultado.additionalInfo.authValidity = true;
                      await local_function.remove_localStorage();
                    }
                    else
                    {
                      localStorage.setItem("pregunta_rut"+conversationID, ["transferir", true, pregunta_rut[2]]);
                    }                                         
                  }

                  // Intentos
                  if(pregunta_rut[0] === "intentar" && pregunta_rut[1] == "true" && (mensaje.toLowerCase() == "si" || mensaje.toLowerCase() == "1"))
                  {
                    resultado.action = msj_preguntas_rut.action;
                    resultado.action.saveHistory = false;
                    resultado.messages.push(msj_preguntas_rut.messages[0]);

                    localStorage.setItem("pregunta_rut"+conversationID, ["rut",true]);  
                  }
                  
                  if(pregunta_rut[0] === "intentar" && mensaje.toLowerCase() != "si" && mensaje.toLowerCase() != "1")
                  {
                    console.log("entro a intentar con un no :: " + mensaje +" :: "+  mensaje.toLowerCase() != "si" || mensaje.toLowerCase() != "1");
                    await local_function.no_autenticado();
                  }                  
                }
              }              
              else
              {
                resultado.action = horarios.action;
                resultado.messages = horarios.messages;               
              }
              console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
            }
            else
            {
              estatus = 400;
              resultado = {
                "message": "El valor de mensaje es requerido",
                "status": "400"
              }
            } 
          }
          else
          {
            estatus = 400;
            resultado = {
              "message": "El valor de contexto es requerido",
              "status": "400"
            }
          } 
        }
        else
        {
          estatus = 400;
          resultado = {
            "message": "El valor de user es requerido",
            "status": "400"
          }
        }        
      }
      else
      {
        estatus = 400;
        resultado = {
          "message": "El valor de channel es requerido",
          "status": "400"
        }
      } 
    }
    else
    {
      estatus = 400;
      resultado = {
        "message": "El valor de authToken es requerido",
        "status": "400"
      }
    }
  }
  else
  {
    estatus = 400;
    resultado = {
      "message": "El valor de apiVersion es requerido",
      "status": "400"
    }
  }

  res.status(estatus).json(resultado);
});

router.post('/notification/send', async (req, res) => {
  
  var resultado = {};
  var masDestinos = false;

  // Campos Oblogatorios
  var channel = req.body.channel;
  var userID = req.body.userID;
  var orgID = req.body.orgID;
  var type = req.body.type;
  var destination = req.body.destination;
  var data = req.body.data;
  var origin = req.body.origin;
  var context = req.body.context;

  // Campos No Obligstorios
  var urlCallbackHSM = req.body.urlCallbackHSM;
  var saveHistory = req.body.saveHistory;
  var systemMessage = req.body.systemMessage;
  var botNotification = req.body.botNotification;

  if(channel !== '' && typeof channel !== "undefined") 
  {
    if(userID !== '' && typeof userID !== "undefined") 
    {
      if(orgID !== '' && typeof orgID !== "undefined") 
      {
        if(type !== '' && typeof type !== "undefined") 
        {
          if(destination !== '' && typeof destination !== "undefined") 
          {
            if(data !== '' && typeof data !== "undefined") 
            {
              if(origin !== '' && typeof origin !== "undefined") 
              {
                if(context !== '' && typeof context !== "undefined") 
                {
                  if(masDestinos)
                  {
                    estatus = 200;
                    resultado.callbackId = "5e55220892cce61967ad7934";
                  }
                  else
                  {
                    resultado.status = 0;
                    resultado.message = "OK";
                  }
                }
                else
                {
                  resultado.status = "NOK";
                  resultado.message = "El contexto es requerido";
                }
              }
              else
              {
                resultado.status = "NOK";
                resultado.message = "El origin es requerido";
              }
            }
            else
            {
              resultado.status = "NOK";
              resultado.message = "El data es requerido";
            }
          }
          else
          {
            resultado.status = "NOK";
            resultado.message = "El destination es requerido";
          }
        }
        else
        {
          resultado.status = "NOK";
          resultado.message = "El type es requerido";
        }
      }
      else
      {
        resultado.status = "NOK";
        resultado.message = "El orgID es requerido";
      }
    }
    else
    {
      resultado.status = "NOK";
      resultado.message = "El userID es requerido";
    }    
  }
  else
  {
    resultado.status = "NOK";
    resultado.message = "El channel es requerido";
  } 

  res.status(200).json(resultado);
});

router.post('/terminateConversation', async (req, res) => {
  var resultado = {};

  var persona = req.body.persona;
  var ejecutivo = req.body.ejecutivo;
  var conversacion = req.body.conversacion;

  if(persona !== '' && typeof persona !== "undefined") 
  {
    if(ejecutivo !== '' && typeof ejecutivo !== "undefined") 
    {
      if(conversacion !== '' && typeof conversacion !== "undefined") 
      { 
        var url = "https://psservices.qa-puresocial.com/notification/send";

        var bandera_label = true;

        if(Array.isArray(conversacion.etiquetas))
        {
          for (var i = 0; i < conversacion.etiquetas.length; i++)
          {
            if(conversacion.etiquetas[i] == "automaticClose")
            {
              bandera_label = false;
            }
          }
        }
        else
        {
            if(conversacion.etiquetas == "automaticClose")
            {
              bandera_label = false;
            }
        }

        if(bandera_label)
        {
          var data = {
            "channel": "whatsapp",
            "userID": persona.telefono,
            "orgID": conversacion.id,
            "type": "text",
            "destination": {
              "type": "recipient",
              "recipients": [ "56972146071" ]
            },
            "data": {
              "text" : "1. Por favor evalúa nuestra atención. En una escala del 1 al 5, donde 1 es pésimo y 5 es excelente."
            },
            "origin": "conversations",
            "context": {},
            "saveHistory": false,
            "systemMessage": "EPA Enviada al cliente",
            "botNotification": true
          }

          console.log("[data] :: ", data);

          var options = {
            method : 'POST',
            url : url,
            headers : { 
              'Content-Type':'application/json',
              'Authorization': "Bearer eyKhbGciOiJIUzdxmklamwkdqwnondqown.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNpeGJlbGwgQ29udmVyc2F0aW9ucyIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjJ9.UIFndsadskacascda_dasda878Cassda_XxsaSllip0__saWEasqwed2341cfSAS"
            },
            data: data
          };

          await axios(options).then(function (response)
          {
            if(response.status == 200 && response.statusText == 'OK')
            {
              resultado.status = response.data.status;
              resultado.message = response.data.message;
              resultado.idCanal = response.data.idCanal;          
            }
            else
            {
              resultado.status = response.data.status;
              resultado.message = response.data.message;
              resultado.idCanal = response.data.idCanal;
            }
          })
          .catch(function (error)
          {
            resultado.status = error.response.data.status;
            resultado.message = error.response.data.message;
          });
        }
        else
        {
          resultado.status = "OK";
          resultado.message = "Contenia la etiqueta automaticClose";
        }
      }
      else
      {
        resultado.status = "NOK";
        resultado.message = "El valor de conversacion es requerido";
      }
    }
    else
    {
      resultado.status = "NOK";
      resultado.message = "El valor del ejecutivo es requerido";      
    } 
  }
  else
  {
    resultado.status = "NOK";
    resultado.message = "El valor de la persona es requerido";    
  }

  console.log("[terminateConversation] :: [resultado] :: ", resultado);

  res.status(200).json(resultado);
});

/*app.post('/terminate', (req, res) => {
  var result, resultado;
  var bandera = false , estatus = 200;

  var conversationID = req.body.conversationId;
  var RRSS = req.body.RRSS;
  var canal = req.body.channel;
  var contexto = req.body.context;

  if(RRSS !== '' && typeof RRSS !== "undefined") 
  {
      if(canal !== '' && typeof canal !== "undefined") 
      {
        if(contexto !== '' && typeof contexto !== "undefined") 
        {
          estatus = 200;
          resultado = {
            "estado": "OK"
          }
        }
        else
        {
          estatus = 400;
          resultado = {
            "estado": "El valor de contexto es requerido"
          }
        }
      }
      else
      {
        estatus = 400;
        resultado = {
          "estado": "El valor de canal es requerido"
        }
      } 
  }
  else
  {
    estatus = 400;
      resultado = {
        "estado": "El valor de RRSS es requerido"
      }
  } 

  res.status(estatus).json(resultado);
});*/


module.exports = router