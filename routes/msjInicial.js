const moment_timezone = require('moment-timezone');
const MsjInicial = require('../models/MsjInicial');
const express = require('express');
const moment = require('moment');

const router = express.Router();

router.post("/msjInicial/insert", async (req, res)=>{
    
    var respuesta = {};

    console.log('Entro a /msjInicial/insert :: ');

    const msjInicial = new MsjInicial(
    {
        titulo : req.body.titulo,
        action : req.body.action,
        messages : req.body.messages
    });

    const result = await msjInicial.save();    

    respuesta.status = "OK";
    respuesta.mensaje = result;

    console.log(respuesta);

    res.status(201).send(respuesta);
});

router.get("/msjInicial/search", async (req, res)=>{
    console.log('Entro a /msjInicial/obtenerAll');

    var respuesta = {};
    const msj = await MsjInicial.find();

    if (msj.length < 1)
    {
        respuesta.status = "NOK";
        respuesta.mensaje = "No hay información disponible";
    }
    else
    {
        respuesta.status = "OK";
        respuesta.mensaje = msj;
    }
    
    res.status(200).send(respuesta);
});

router.put("/msjInicial/update", async (req, res)=>{
    
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
                "action" : req.body.action,
                "messages" : req.body.messages, 
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