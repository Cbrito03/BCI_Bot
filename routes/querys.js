const Horarios_cli = require('../models/Horarios_clientes');
const Intentos_cli = require('../models/Intentos_clientes');
const moment_timezone = require('moment-timezone');
const Reporte = require('../models/Reporte');
const express = require('express');
const moment = require('moment');

const router = express.Router();

/*************** Consulta Reportes ***************/
router.get("/query/reporte", async (req, res) => {
    
    console.log('Entro a /query/reporte');

    var respuesta = {
        "status" : "",
        "result" : "",
        "total" : 0
    };

    const reporte = await Reporte.find();

    if (reporte.length < 1)
    {
        respuesta.status = "NOK";
        respuesta.result = "No hay información disponible";
    }
    else
    {
        for (var i = 0; i <= reporte.length; i++)
        {
             respuesta.total = i;
        }

        respuesta.status = "OK";
        respuesta.result = reporte;
    }
    
    res.status(200).send(respuesta);
});

/*************** Consulta Intentos Cliente ***************/
router.get("/query/intentos_cli", async (req, res) => {
    
    console.log('Entro a /query/intentos_cli');

    var respuesta = {
        "status" : "",
        "result" : "",
        "total" : 0
    };

    const reporte = await Intentos_cli.find();

    if (reporte.length < 1)
    {
        respuesta.status = "NOK";
        respuesta.result = "No hay información disponible";       
    }
    else
    {
        for (var i = 0; i <= reporte.length; i++)
        {
             respuesta.total = i;
        }

        respuesta.status = "OK";
        respuesta.result = reporte;
    }
    
    res.status(200).send(respuesta);
});

/*************** Consulta Horario Cliente ***************/
router.get("/query/horario_cli", async (req, res) => {
    
    console.log('Entro a /query/horario_cli');

    var respuesta = {
        "status" : "",
        "result" : "",
        "total" : 0
    };

    const reporte = await Horarios_cli.find();

    if (reporte.length < 1)
    {
        respuesta.status = "NOK";
        respuesta.result = "No hay información disponible";
    }
    else
    {
        for (var i = 0; i <= reporte.length; i++)
        {
             respuesta.total = i;
        }

        respuesta.status = "OK";
        respuesta.result = reporte;
    }
    
    res.status(200).send(respuesta);
});


module.exports = router;