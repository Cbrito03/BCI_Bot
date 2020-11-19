const moment_timezone = require('moment-timezone');
const Config = require('../models/Configuracion');
const BotMjs = require('../models/BotMensajes');
const express = require('express');
const moment = require('moment');

const router = express.Router();

/* ################### MENSAJES ################### */

// ######## INSERTS
router.post("/config/mensajes/insert", async (req, res)=>{
    
    var respuesta = {};

    console.log('Entro a /config/mensajes/insert :: ');

    /*
        ######## Típo de texto ########
        [1] = "Fuera de horario"
        [2] = "No es cliente"
        [3] = "Aut erronea"
        [4] = "Aut Exitosa"
        [5] = "Validación Rut"
    */

    const botMjs = new BotMjs(
    {
        titulo : req.body.titulo,
        action : req.body.action,
        messages : req.body.messages,
        tipo : req.body.tipo
    });

    const result = await BotMjs.find({"titulo" : req.body.titulo});

    if (result.length < 1)
    {
        const result = await botMjs.save();
        respuesta.status = "OK";
        respuesta.mensaje = result;  
    }
    else
    {
        respuesta.status = "NOK";
        respuesta.mensaje = "Este mensaje ya se encuentra registrado";
    }

    console.log(respuesta);

    res.status(201).send(respuesta);
});

// ######## CONSULTAS

router.get("/config/mensajes/search", async (req, res)=>{
    console.log('Entro a /config/mensajes/obtenerAll');

    var respuesta = {};
    const result = await BotMjs.find();

    if (result.length < 1)
    {
        respuesta.status = "NOK";
        respuesta.mensaje = "No hay información disponible";
    }
    else
    {
        respuesta.status = "OK";
        respuesta.mensaje = result;
    }
    
    res.status(200).send(respuesta);
});

/// ######## MODIFICACIONES

router.put("/config/mensajes/update", async (req, res)=>{
    
    console.log('Entro a /config/mensajes/update :: ');

    var respuesta = {};

    var queryExiste = { "titulo" : req.body.titulo, "_id" : req.body.id };

    const existe = await BotMjs.find(queryExiste);

    console.log("existe :: ", existe);

    if (existe.length >= 1)
    {       
        var payload = { 
            $set: {
                "titulo": req.body.titulo, 
                "action": req.body.action,
                "messages": req.body.messages,
                "tipo": req.body.tipo,
                "status": req.body.status 
            } 
        };  

        const res_msj = await BotMjs.updateOne(queryExiste, payload);

        console.log(res_msj);

        if (res_msj.nModified >= 1 || res_msj.n >= 1)
        {
            respuesta.status = "OK";
            respuesta.mensaje = "Se actualizo correctamente";
        }
        else if (res_msj.n == 0 && res_msj.nModified == 0 && res_msj.ok == 1)
        {
            respuesta.status = "NOK";
            respuesta.mensaje = "No se encontro información para modificar";
        }
        else
        {
            respuesta.status = "NOK";
            respuesta.mensaje = "Se genero un error al modificar";
        }
    }
    else
    {
        respuesta.status = "NOK";
        respuesta.mensaje = "No hay información disponible.";
    }   

    res.status(200).send(respuesta);
});

/* ################### CONFIGURACIONES ################### */

// ######## INSERTS
router.post("/config/insert", async (req, res)=>{
    
    var respuesta = {};

    console.log('Entro a /config/insert :: ');

    const config = new Config(
    {
        titulo : req.body.titulo,
        descripcion : req.body.descripcion,
        valor : req.body.valor
    });

    const result = await config.save();    

    respuesta.status = "OK";
    respuesta.mensaje = result;

    console.log(respuesta);

    res.status(201).send(respuesta);
});

// ######## CONSULTAS

router.get("/config/search", async (req, res)=>{
    console.log('Entro a /msjInicial/obtenerAll');

    var respuesta = {};
    const config = await Config.find({"status": true});

    if (config.length < 1)
    {
        respuesta.status = "NOK";
        respuesta.mensaje = "No hay información disponible";
    }
    else
    {
        respuesta.status = "OK";
        respuesta.mensaje = config;
    }
    
    res.status(200).send(respuesta);
});

// ######## MODIFICACIONES

router.put("/config/update", async (req, res)=>{
    
    console.log('Entro a /msjInicial/modificar :: ');

    var respuesta = {};
    var myquery = { "titulo" : req.body.titulo };

    const msj = await MsjInicial.find(myquery);

    console.log("msj :: ", msj);

    if (msj.length >= 1)
    {       
        var payload = { 
            $set: {
                "titulo": req.body.titulo, 
                "texto": req.body.texto, 
                "status": req.body.status 
            } 
        };  

        const res_msj = await MsjInicial.updateOne(myquery, payload);

        console.log(res_msj);

        if (res_msj.nModified >= 1 || res_msj.n >= 1)
        {
            respuesta.status = "OK";
            respuesta.mensaje = "Se actualizo correctamente";
        }
        else if (res_msj.n == 0 && res_msj.nModified == 0 && res_msj.ok == 1)
        {
            respuesta.status = "NOK";
            respuesta.mensaje = "No se encontro información para modificar";
        }
        else
        {
            respuesta.status = "NOK";
            respuesta.mensaje = "Se genero un error al modificar";
        }
    }
    else
    {
        respuesta.status = "NOK";
        respuesta.mensaje = "No hay información disponible.";
    }   

    res.status(200).send(respuesta);
});

module.exports = router;