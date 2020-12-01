const local_storage = require('../controllers/local_storage.js');
const horario = require('../controllers/validar_horario.js');
const moment_timezone = require('moment-timezone');
const controlador = require('../controllers/controller.js');
const Horarios = require('../models/Horarios');
const localStorage = require('localStorage');
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

  console.log("lastMessageTime :: " + context.lastMessageTime);

  var now = moment();
  var fechaStamp = moment(context.lastInteractionFinishTime).subtract(3, 'hours');
  //var fechaStamp = moment(context.lastMessageTime)/*.subtract(6, 'hours')*/;
  fechaStamp = moment(fechaStamp).format("YYYY-MM-DD HH:mm:ss");
  var fecha_actual = now.tz("America/Santiago").format("YYYY-MM-DD HH:mm:ss");
  var fecha2 = moment(fecha_actual, "YYYY-MM-DD HH:mm:ss");

  console.log("fechaStamp :: " + fechaStamp + " :: fecha Actual :: " + fecha_actual);

  var diff = fecha2.diff(fechaStamp, 'h'); 
  console.log("diff :: " + diff + " Tipo " + typeof diff);
  
  var horarios = await controlador.funciones.validarHorario();  

  console.log("[BCI] :: [message] :: [horarios] :: " + horarios.status);

  // Obtener mensajes de la base de datos
    var msj_inicial = await controlador.funciones.cargar_msj_incial();
    var msj_cliente = await controlador.funciones.cargar_mensajes();
    var msj_no_cliente = await controlador.funciones.cargar_no_cliente();
    var msj_aut_exitosa = await controlador.funciones.cargar_aut_exitoso();
    var msj_aut_erroneo = await controlador.funciones.cargar_aut_errroneo();
    var msj_preguntas_rut = await controlador.funciones.cargar_preguntas_rut();
    var msj_preguntas_EPA = await controlador.funciones.cargar_preguntas_EPA();
    var msj_fin_EPA = await controlador.funciones.cargar_fin_EPA();

  var local_function = {
    si_autenticado : async function()
    {
      console.log("[local_function] :: [si_autenticado]");

      resultado.action = msj_aut_exitosa.action;
      resultado.action["type"] = "continue"; 
      resultado.action.saveHistory = true;
      resultado.messages.push(msj_aut_exitosa.messages[0]);   
      resultado.messages[0].text = resultado.messages[0].text.replace("<nombre cliente>", user.name);    
    },
    no_autenticado : async function()
    {
      console.log("[local_function] :: [no_autenticado]");

      resultado.action = msj_aut_exitosa.action;
      resultado.action.saveHistory = true;                  
      resultado.messages.push(msj_aut_exitosa.messages[1]);
      resultado.additionalInfo.authValidity = false;   
    },
    no_cliente : async function(e)
    {
      console.log("[local_function] :: [no_cliente]");

      resultado.action = msj_no_cliente.action;
      resultado.messages.push(msj_no_cliente.messages[0]);
      resultado.additionalInfo.authValidity = false;
    },
    fin_EPA : async function(e)
    {
      console.log("[local_function] :: [fin EPA]");
      if(e)
      {
        resultado.action = msj_fin_EPA.action;
        resultado.messages.push(msj_fin_EPA.messages[0]);
      }
      else
      {
        resultado.action = msj_fin_EPA.action;
        resultado.messages.push(msj_fin_EPA.messages[0]);
        resultado.additionalInfo.authValidity = false;
      }   
    },
    remove_localStorage : async function()
    {
      console.log("[local_function] :: [remove_localStorage]");

      localStorage.removeItem("bot_bci_"+conversationID);
      localStorage.removeItem("pregunta_rut"+conversationID);
      localStorage.removeItem("valida_vigencia"+conversationID);
      localStorage.removeItem("intento"+conversationID);
      localStorage.removeItem("preguntas_EPA_"+user.id);
      localStorage.removeItem("guardar_EPA_"+user.id);
      localStorage.removeItem("intento_EPA"+conversationID);
      localStorage.removeItem("NOTIFICATION"+user.id)
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

              console.log("[BCI] :: [message] :: [lastMessageFrom] :: " + context.lastMessageFrom + " :: [Diferecnia] :: " + diff);          

              if((context.lastMessageFrom == "NOTIFICATION" && diff < 24) || localStorage.getItem("NOTIFICATION"+user.id) == "NOTIFICATION")
              {
                // Aplico Flujo de la EPA (Preguntas que tengo que guardar en una colección)
               
                console.log("[EPA] :: [pregunta_EPA] :: " + localStorage.getItem("preguntas_EPA_"+user.id));

                var bandera_res1 = await controlador.funciones.valida_respuesta_EPA(mensaje);

                console.log("[EPA] :: [Respuesta_EPA] :: ", bandera_res1);

                var num_intentos_EPA = localStorage.getItem("intento_EPA"+conversationID);

                if(localStorage.getItem("preguntas_EPA_"+user.id) == null)
                {

                  if(num_intentos_EPA == null)
                  {
                    num_intentos_EPA = 0;
                  }

                  num_intentos_EPA = parseInt(num_intentos_EPA) + 1;

                  console.log("[EPA] :: [num_intentos_EPA] :: ", num_intentos_EPA);
                      
                  if(bandera_res1 && num_intentos_EPA <= 2 )
                  {
                    console.log("[EPA] :: [Respuesta_EPA] :: [Entro al IF] ", bandera_res1);

                    if(localStorage.getItem("preguntas_EPA_"+user.id) == null)
                    {                  
                      resultado.action = msj_preguntas_EPA.action;
                      resultado.messages.push(msj_preguntas_EPA.messages[1]);

                      localStorage.setItem("preguntas_EPA_"+user.id, mensaje);
                      localStorage.setItem("NOTIFICATION"+user.id, "NOTIFICATION");
                      localStorage.setItem("guardar_EPA_"+user.id, "true");
                    }
                  }
                  else if(num_intentos_EPA >= 2 )
                  {
                    resultado.action = msj_fin_EPA.action;
                    resultado.messages.push(msj_fin_EPA.messages[0]);

                    await controlador.configuraciones.clearClientTimeOut(user.id, conversationID);
                    await local_function.remove_localStorage();
                    
                  }
                  else if(!bandera_res1 && num_intentos_EPA <= 1 )
                  {
                    resultado.action = msj_preguntas_EPA.action;
                    resultado.messages.push(msj_preguntas_EPA.messages[0]);

                    localStorage.setItem("intento_EPA"+conversationID, num_intentos_EPA);
                    localStorage.setItem("NOTIFICATION"+user.id, "NOTIFICATION");
                  }

                }
                else if(localStorage.getItem("guardar_EPA_"+user.id) == "true")
                {
                  console.log("[EPA] :: Guardar_EPA :: " + localStorage.getItem("guardar_EPA_"+user.id));

                  resultado.action = msj_fin_EPA.action;
                  resultado.messages.push(msj_fin_EPA.messages[0]);

                  var rest_EPA = {
                    "pregunta_1" : localStorage.getItem("preguntas_EPA_"+user.id),
                    "pregunta_2" : mensaje,
                    "horario" : horarios.status,
                    "id" : user.id,
                    "name" : user.name,
                    "channel" : context.channel
                  }

                  await controlador.funciones.registrar_preguntas_EPA(rest_EPA);
                  await controlador.configuraciones.clearClientTimeOut(user.id);
                  await local_function.remove_localStorage();
                }
              }
              /*else if(localStorage.getItem("guardar_EPA_"+user.id) == "true")
              {
                console.log("[EPA] :: Guardar_EPA :: " + localStorage.getItem("guardar_EPA_"+user.id));
                
                resultado.action = msj_fin_EPA.action;
                resultado.messages.push(msj_fin_EPA.messages[0]);

                var rest_EPA = {
                  "pregunta_1" : localStorage.getItem("preguntas_EPA_"+user.id),
                  "pregunta_2" : mensaje,
                  "horario" : horarios.status,
                  "id" : user.id,
                  "name" : user.name,
                  "channel" : context.channel
                }

                await controlador.funciones.registrar_preguntas_EPA(rest_EPA);
                await controlador.configuraciones.clearClientTimeOut(user.id);
                await local_function.remove_localStorage();
              }*/
              else if(horarios.status)
              {
                var valida_vigencia = await controlador.funciones.valida_vigencia(user.id);

                localStorage.setItem("valida_vigencia"+conversationID, valida_vigencia.id);

                console.log("[valida_vigencia] :: " + valida_vigencia.authValidity);

                if(localStorage.getItem("bot_bci_"+conversationID) == null )
                {
                  resultado.action = msj_inicial.action;
                  resultado.messages.push(msj_inicial.messages[0]);

                  localStorage.setItem("bot_bci_"+conversationID, "cliente");
                  localStorage.setItem("pregunta_rut"+conversationID, ["rut",false]);
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
                  
                  if(pregunta_rut[0] == "rut" && pregunta_rut[1] == "true" )
                  {
                    var bandera_vali_rut = await controlador.funciones.validación_campos_rut(pregunta_rut[0], mensaje);
                    
                    var rut_vigencia =  localStorage.getItem("valida_vigencia"+conversationID);                    

                    if(bandera_vali_rut)
                    {
                      var vig = valida_vigencia.authValidity;
                      var rt_vig = rut_vigencia.replace(/-/g,"");

                      console.log("[Cliente ingreso RUT] :: authValidity :: "+ vig +" :: RUT :: "+ rt_vig +" :: == :: "+ mensaje);

                      // si esta autenticado el rut SI es igual
                      if(vig == true && rt_vig == mensaje)
                      {
                        await local_function.si_autenticado();                        

                        localStorage.setItem("pregunta_rut"+conversationID, ["transferir", true, valida_vigencia.id]);
                        localStorage.setItem("bot_bci_"+conversationID, "cliente");
                      }                      
                      
                      // No existe  o  NO esta autenticado y el rut no es igual
                      if(vig === 99 || vig == false && rt_vig != mensaje)
                      { 
                        await local_function.no_cliente();

                        await local_function.remove_localStorage();
                      }

                      //si esta autenticado pero el rut no es igual
                      if(vig == true && rt_vig != mensaje)
                      {
                        await local_function.no_cliente();

                        await local_function.remove_localStorage();
                        //await local_function.si_autenticado();

                        //localStorage.setItem("pregunta_rut"+conversationID, ["transferir","NOAUT"]);
                      }   
                      
                      // NO esta autenticado y el rut si es igual
                      if(vig == false && rt_vig == mensaje) 
                      {                         
                        var respuesta_rut = localStorage.getItem("respuesta_rut"+conversationID);

                        if(respuesta_rut == null)
                        {
                          localStorage.setItem("respuesta_rut"+conversationID, mensaje); 
                        }

                        resultado.action = msj_preguntas_rut.action;
                        resultado.action.saveHistory = false;
                        resultado.messages.push(msj_preguntas_rut.messages[1]);
                        resultado.messages.push(msj_preguntas_rut.messages[2]);

                        localStorage.setItem("pregunta_rut"+conversationID, ["numSerie",true]);               
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
                    var bandera_vali_serie = await controlador.funciones.validación_campos_rut(pregunta_rut[0], mensaje);
                    
                    if(bandera_vali_serie)
                    {
                      var respuesta_rut = localStorage.getItem("respuesta_rut"+conversationID);

                      //var axios_CEDU = await controlador.funciones.preguntas_sinacofi_CEDU(respuesta_rut, mensaje);
                      var axios_CEDU = await controlador.funciones.validar_cliente_solem(respuesta_rut, mensaje);
                      
                      console.log("Resultado de CEDU :::::::: code :: " + axios_CEDU.code + " :: status :: " + axios_CEDU.status);

                      if(axios_CEDU.status)
                      {
                        if(axios_CEDU.code == 200 || axios_CEDU.code == 409)
                        {
                          console.log("");
                          await local_function.si_autenticado();

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

                          console.log("Resultado de CEDU :::::::: " + axios_CEDU.code);

                          if(axios_CEDU.code == 406 &&  parseInt(num_intentos) <= 1 )
                          {                            
                            resultado.action = msj_aut_erroneo.action;

                            for (var i = 0; i < msj_aut_erroneo.messages.length; i++)
                            {
                              resultado.messages.push(msj_aut_erroneo.messages[i]);
                            }

                            localStorage.setItem("intento"+conversationID, num_intentos);
                            localStorage.setItem("pregunta_rut"+conversationID, ["intentar", true])
                          }
                          else if(parseInt(num_intentos) >= 2)// cambiar valor a  no autenticado en el contexto
                          {
                            await local_function.si_autenticado();

                            var rest_int = {
                              "id" : user.id,                                    
                              "name" : user.name,
                              "intento" : true,
                              "channel" : context.channel
                            }

                            await controlador.funciones.registrar_intentos_clientes(rest_int);

                            localStorage.setItem("pregunta_rut"+conversationID, ["transferir","NOAUT"]);

                            /*await local_function.no_autenticado();
                            await local_function.remove_localStorage();*/
                          }
                          else // cambiar valor a  no autenticado en el contexto
                          {
                            await local_function.si_autenticado();

                            localStorage.setItem("pregunta_rut"+conversationID, ["transferir","NOAUT"]);

                            /*await local_function.no_autenticado();
                            await local_function.remove_localStorage();*/
                          }
                        }
                      }
                      else // cambiar valor a  no autenticado en el contexto
                      {
                        await local_function.si_autenticado();

                        localStorage.setItem("pregunta_rut"+conversationID, ["transferir","NOAUT"]);

                        /*await local_function.no_autenticado();
                        await local_function.remove_localStorage();*/
                      }                      
                    }
                    else
                    {
                      resultado.action = msj_preguntas_rut.action;
                      resultado.action.saveHistory = false;
                      resultado.messages.push(msj_preguntas_rut.messages[1]);
                    }                                     
                  }

                  if(pregunta_rut[0] === "transferir" && pregunta_rut[1] == "true")
                  {
                    console.log(" [BCI] :: [transferir] :: [TRUE]");
                    resultado.action = msj_aut_exitosa.action;
                    resultado.action.saveHistory = true;
                    resultado.messages.push(msj_aut_exitosa.messages[1]);
                    resultado.additionalInfo.authValidity = true;
                    await local_function.remove_localStorage();                                                             
                  }

                  if(pregunta_rut[0] === "transferir" && pregunta_rut[1] == "NOAUT")
                  {
                    console.log(" [BCI] :: [transferir] :: [NOAUT]");                   
                    resultado.action = msj_aut_exitosa.action;
                    resultado.action.saveHistory = true;
                    resultado.messages.push(msj_aut_exitosa.messages[1]);
                    resultado.additionalInfo.authValidity = false;
                    await local_function.remove_localStorage();
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
                    await local_function.fin_EPA(false);
                    await local_function.remove_localStorage();
                    //await local_function.no_autenticado();
                  }                  
                }
              }             
              else
              {
                resultado.action = horarios.action;
                resultado.messages = horarios.messages;

                var rest_hr = {
                  "id" : user.id,                                    
                  "name" : user.name,
                  "horario" : horarios.status,
                  "channel" : context.channel
                }

                await controlador.funciones.registrar_horarios_clientes(rest_hr);
                await local_function.remove_localStorage();             
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

  console.log("[BCI] :: [FINAL] :: [resultado] :: [action]", resultado.action.type);
  console.log("[BCI] :: [FINAL] :: [resultado] :: [text]", resultado.messages[0].text);
  console.log("[BCI] :: [FINAL] :: [resultado] :: [authValidity]", resultado.additionalInfo.authValidity);

  res.status(estatus).json(resultado);
});

router.post('/terminateConversation', async (req, res) => {
  var resultado = {};

  console.log("[terminateConversation] :: [EPA] :: [Se envio EPA al Cliente]");

  var persona = req.body.persona;
  var ejecutivo = req.body.ejecutivo;
  var conversacion = req.body.conversacion;

  var msj_inicio_EPA = await controlador.funciones.cargar_inicio_EPA();
    var msj_pregunta_1_EPA = await controlador.funciones.cargar_preguntas_EPA();
    var msj_inicio_EPA = await controlador.funciones.cargar_inicio_EPA();
    var msj_fin_EPA = await controlador.funciones.cargar_fin_EPA();
    var config = await controlador.configuraciones.get_config();

  console.log("[terminateConversation] :: [EPA] :: [config] :: " + config.url_EPA);

  if(persona !== '' && typeof persona !== "undefined") 
  {
    if(ejecutivo !== '' && typeof ejecutivo !== "undefined") 
    {
      if(conversacion !== '' && typeof conversacion !== "undefined") 
      {
        var bandera_label = true;

        console.log("[terminateConversation] :: [EPA] :: [Datos]:: [userId] ::" + conversacion.userId  + " :: [orgId] :: " + conversacion.orgId + " :: [telefono] ::" + persona.telefono);

        if(Array.isArray(conversacion.etiquetas))
        {
          console.log("[terminateConversation] :: [EPA] :: [array] :: " + true);
          for (var i = 0; i < conversacion.etiquetas.length; i++)
          {
            console.log("[terminateConversation] :: [EPA] :: [array FOR]:: " + true + " :: [FOR] :: [Etiqueta - "+i+"] :: " + conversacion.etiquetas[i] );
            
            if(conversacion.etiquetas[i] == "automaticClose")
            {
              console.log("[terminateConversation] :: [EPA] :: [array FOR IF] :: " + true + " :: [Etiqueta] ::" + true + " :: [FOR] :: [Etiqueta - "+i+"] :: " + conversacion.etiquetas[i] );
              bandera_label = false;
            }
          }
        }
        else
        {
          console.log("[terminateConversation] [EPAarray]:: " + false + " :: [etiquetas] :: " + conversacion.etiquetas);
          if(conversacion.etiquetas == "automaticClose")
          {
            console.log("[terminateConversation] [EPAarray]:: " + false + " :: [etiquetas SI] :: " + conversacion.etiquetas + " :: [etiquetas] :: " + true);
            bandera_label = false;
          }
        }

        if(bandera_label)
        {
          var data = {
            "channel": "whatsapp",
            "userID": conversacion.userId,
            "orgID": conversacion.orgId,
            "type": "text",
            "destination": {
              "type": "recipient",
              "recipients": [ persona.telefono ]
            },
            "data":{
                "text" : msj_inicio_EPA.messages[0].text + " \n " + msj_pregunta_1_EPA.messages[0].text
            },
            "origin": "conversations",
            "context": {},
            "saveHistory": false,
            "systemMessage": "EPA Enviada al cliente",
            "botNotification": true
          };          

          console.log("[terminateConversation] :: [EPA] :: [Datos] :: [data channel] :: " + data.channel);
            console.log("[terminateConversation] :: [EPA] :: [Datos] :: [data userID] :: " + data.userID);
            console.log("[terminateConversation] :: [EPA] :: [Datos] :: [data orgID] :: " + data.orgID);
            console.log("[terminateConversation] :: [EPA] :: [Datos] :: [data data Text :: " + data.data.text);
            console.log("[terminateConversation] :: [EPA] :: [Datos] :: [data recipients] :: " + persona.telefono);
            console.log("[terminateConversation] :: [EPA] :: [Datos] :: [config.url_EPA] :: " + config.url_EPA);
            console.log("[terminateConversation] :: [EPA] :: [Datos] :: [config.authorization] :: " + config.authorization);
            console.log("[terminateConversation] :: [EPA] :: [Datos] :: [persona.telefono] :: " + persona.telefono);
          
          var options = {
            method : 'POST',
            url : config.url_EPA,
            headers : { 
              'Content-Type':'application/json',
              'Authorization': config.authorization //"Bearer eyKhbGciOiJIUzdxmklamwkdqwnondqown.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNpeGJlbGwgQ29udmVyc2F0aW9ucyIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjJ9.UIFndsadskacascda_dasda878Cassda_XxsaSllip0__saWEasqwed2341cfSAS"
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

              controlador.funciones.startClientTimeOut(persona.telefono, data);
              //setStorage('clave_EPA_' + persona.telefono, 'Valor_EPA', parseInt(config.timer_EPA));  // 900 15 minutos   }
            }
            else
            {
              resultado.status = response.data.status;
              resultado.message = response.data.message;
              resultado.idCanal = response.data.idCanal;
            }

            console.log("[terminateConversation] :: [EPA] :: [OK] :: [status]:: " + resultado.status + " :: [EPAMenssage] :: " + resultado.message + " :: [EPAIdCanal] :: " + resultado.idCanal);
          })
          .catch(function (error)
          {
            resultado.status = error.response.data.status;
            resultado.message = error.response.data.message;

            console.log("[terminateConversation] :: [EPA] :: [ERROR] :: [status]:: " + resultado.status + " :: [EPAMenssage] :: " + resultado.message);
          });
        }
        else
        {
          resultado.status = "OK";
          resultado.message = "Contenia la etiqueta automaticClose";

          console.log("[terminateConversation] :: [EPA] :: [bandera_label]" + bandera_label + " :: [status]:: " + resultado.status + " :: [EPAMenssage] :: " + resultado.message);
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

  res.status(200).json(resultado);
});

router.post('/test', async (req, res) => {

  var rut = req.body.rut;
  var numSerie = req.body.numSerie;
  
  var validar_cliente_solem = await controlador.funciones.validar_cliente_solem(rut,numSerie);
  
  var respuesta = validar_cliente_solem;

  res.status(200).send(respuesta);
});

router.get('/test', async (req, res) => {
  var now = moment();
  var fecha_actual = now.tz("America/Santiago").format("YYYY-MM-DD HH:mm:ss");
  var anio = now.tz("America/Santiago").format("YYYY");

  var horarios = await controlador.funciones.validarHorario();
  
  var respuesta = "Bienvenido al menú Bot de <strong>BCI</strong> <br> " +
      "Hora CL Actual: <strong> " + fecha_actual + " </strong><br> " +
      "Horario habil: <strong> " + horarios.status + " </strong><br> " +
      "<strong> Sixbell "+anio+" - Versión: 1.0.0 </strong><br>";

  res.status(200).send(respuesta);
});

module.exports = router