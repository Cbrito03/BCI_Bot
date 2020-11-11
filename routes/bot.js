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
  
  var horarios = await controlador.funciones.validarHorario();  

  console.log("[BCI] :: [message] :: [horarios] :: " + horarios.status);

  var msj_inicial = await controlador.funciones.cargar_msj_incial();

  var msj_cliente = await controlador.funciones.cargar_mensajes();

  var msj_no_cliente = await controlador.funciones.cargar_no_cliente();

  var msj_aut_exitosa = await controlador.funciones.cargar_aut_exitoso();

  var msj_aut_erroneo = await controlador.funciones.cargar_aut_errroneo();

  var msj_preguntas_rut = await controlador.funciones.cargar_preguntas_rut();

  var local_function = {
    no_autenticado : async function()
    {
      console.log("[local_function] :: [no_autenticado]");

      resultado.action = msj_aut_exitosa.action;                    
      resultado.messages.push(msj_aut_exitosa.messages[1]);
      resultado.additionalInfo.authValidity = false;

      localStorage.clear();     
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

              if(horarios.status)
              {
                if(localStorage.getItem("bot_bci_"+conversationID) == null )
                {
                  var valida_vigencia = await controlador.funciones.valida_vigencia(user.id);

                  localStorage.setItem("valida_vigencia"+conversationID, valida_vigencia.id);

                  console.log("NO ES CLIENTE **************", valida_vigencia.authValidity, typeof valida_vigencia.authValidity);

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

                    localStorage.clear();
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
                      localStorage.clear();
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

app.post('/notification/send', (req, res) => {
  var result, resultado;
  var bandera = false , estatus = 200;

  var persona = req.body.persona;
  var ejecutivo = req.body.ejecutivo;
  var conversacion = req.body.conversacion;

  if(persona !== '' && typeof persona !== "undefined") 
  {
      if(ejecutivo !== '' && typeof ejecutivo !== "undefined") 
      {
        if(conversacion !== '' && typeof conversacion !== "undefined") 
        {
          var url = "https://cvst.qa-puresocial.com/sendConversationsEvent/specialEventChat";

          var data = {
            "callData": {
              "token": "1111111",
              "urlWebhookListener": "https://psservices.qa-puresocial.com/chatApi/webhookListener",
              "eventData": {
                "conversationId": conversacion.id,
                "eventInfo": {
                  "type": "channelChatFinishEPA",
                  "info": {
                    "text": "Se finalizó la EPA."
                  }
                }
              }
            }
          };    

          var options = {
            method : 'POST',
            url : url,
            headers : { 
              'Content-Type':'application/json',
              'Authorization': config.authorization
            },
            data: data
          };

          var resultado_axios = await axios(options);

          console.log("[terminateConversation] :: [resultado_axios] :: ",resultado_axios);

          if(resultado_axios.status == 200 && resultado_axios.statusText == 'OK')
          {
            
          }
            
          resultado = {
            "estado": "OK"
          }
        }
        else
        {
          estatus = 400;
          resultado = {
            "estado": "El valor de conversacion es requerido"
          }
        }
      }
      else
      {
        estatus = 400;
        resultado = {
          "estado": "El valor del ejecutivo es requerido"
        }
      } 
  }
  else
  {
    estatus = 400;
      resultado = {
        "estado": "El valor de la persona es requerido"
      }
  } 

  res.status(estatus).json(resultado);
});

/*app.post('/terminateConversation', (req, res) => {
  var result, resultado;
  var bandera = false , estatus = 200;

  var persona = req.body.persona;
  var ejecutivo = req.body.ejecutivo;
  var conversacion = req.body.conversacion;

  if(persona !== '' && typeof persona !== "undefined") 
  {
      if(ejecutivo !== '' && typeof ejecutivo !== "undefined") 
      {
        if(conversacion !== '' && typeof conversacion !== "undefined") 
        {
          var url = "https://cvst.qa-puresocial.com/sendConversationsEvent/specialEventChat";

          var data = {
            "callData": {
              "token": "1111111",
              "urlWebhookListener": "https://psservices.qa-puresocial.com/chatApi/webhookListener",
              "eventData": {
                "conversationId": conversacion.id,
                "eventInfo": {
                  "type": "channelChatFinishEPA",
                  "info": {
                    "text": "Se finalizó la EPA."
                  }
                }
              }
            }
          };    

          var options = {
            method : 'POST',
            url : url,
            headers : { 
              'Content-Type':'application/json',
              'Authorization': config.authorization
            },
            data: data
          };

          var resultado_axios = await axios(options);

          console.log("[terminateConversation] :: [resultado_axios] :: ",resultado_axios);

          if(resultado_axios.status == 200 && resultado_axios.statusText == 'OK')
          {
            
          }
            
          resultado = {
            "estado": "OK"
          }
        }
        else
        {
          estatus = 400;
          resultado = {
            "estado": "El valor de conversacion es requerido"
          }
        }
      }
      else
      {
        estatus = 400;
        resultado = {
          "estado": "El valor del ejecutivo es requerido"
        }
      } 
  }
  else
  {
    estatus = 400;
      resultado = {
        "estado": "El valor de la persona es requerido"
      }
  } 

  res.status(estatus).json(resultado);
});*/

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