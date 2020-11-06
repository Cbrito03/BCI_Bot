const moment_timezone = require('moment-timezone');
const Horarios = require('../models/Horarios');
const express = require('express');
const moment = require('moment');

const router = express.Router();

router.put("/horarios/modificar", async (req, res)=>{
    
    console.log('Entro a /horarios/modificar :: ');

    var respuesta = {};

    var myquery = { "dia": req.body.dia };

    var payload = { 
        $set: {
            "open_hour" : req.body.open_hour,
            "open_minute" : req.body.open_minute,
            "close_hour" : req.body.close_hour,
            "close_minute" : req.body.close_minute,
            "status" : req.body.status
        } 
    };  

    const res_horarios = await Horarios.updateOne(myquery, payload);

    console.log(res_horarios);   

    if (res_horarios.nModified >= 1 || res_horarios.n >= 1)
    {
        respuesta.status = "OK";
        respuesta.mensaje = "Se actualizo correctamente";
    }
    else if (res_horarios.n == 0 && res_horarios.nModified == 0 && res_horarios.ok == 1)
    {
        respuesta.status = "NOK";
        respuesta.mensaje = "No se encontro información para modificar";
    }
    else
    {
        respuesta.status = "NOK";
        respuesta.mensaje = "Se genero un error al modificar";
    }

    res.status(200).send(respuesta);
});

module.exports = router;