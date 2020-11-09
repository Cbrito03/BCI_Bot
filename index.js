
const moment_timezone = require('moment-timezone');
const localStorage = require('localStorage');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const request = require('request');
const moment = require('moment');
const dotenv = require('dotenv');
const axios = require('axios');
const async = require('async');
const cors = require('cors');
const http = require('http');
const util = require('util');
const fs = require('fs');
const app = express();

dotenv.config();

console.log('Iniciando API BOT...');

//const horario = require('./controllers/validar_horario.js');
const bot = require('./routes/bot');
const horarios = require('./routes/horarios');
const usuarios = require('./routes/usuarios');
const msjInicial = require('./routes/msjInicial');
const config = require('./routes/configuraciones.js');

const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(bot);
app.use(horarios);
app.use(usuarios);
app.use(msjInicial);
app.use(config);
app.use(express.static("web"));

app.get('/', (req, res) => {
	var now = moment();
	var fecha_actual = now.tz("America/Guatemala").format("YYYY-MM-DD HH:mm:ss");
	var anio = now.tz("America/Guatemala").format("YYYY");

	var respuesta = "Bienvenido al menú Bot de <strong>BCI</strong> <br>" + 
	   "<strong> Sixbell "+anio+" - Versión: 1.0.0 </strong><br>";

	res.status(200).send(respuesta);
});

app.listen(port, app, async () => {
    console.log("[Brito] :: API escuchando en puerto", port, 'Conectando a MongoDb...');

    await mongoose.connect(`mongodb://${process.env.URL_MONGODB}/${process.env.BD_MONGODB}?authSource=admin&replicaSet=replset`,
    {
        tls: true,    
        tlsCAFile: "cert/cert.pem",
        useUnifiedTopology: true ,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log('Conexión establecida a MongoDb'))
    .catch(error => {
        console.log('[Brito] :: No se ha logrado conectar a MongoDb :\n', error)
        console.log('[Brito] :: Deteniendo API...')
        process.exit(1)
    });

    /*await mongoose.connect(`mongodb://${process.env.URL_MONGODB}/${process.env.BD_MONGODB}?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false`,
    					  {useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => console.log('Conexión establecida a MongoDb'))
    .catch(error => {
        console.log('[Brito] :: No se ha logrado conectar a MongoDb :\n', error)
        console.log('[Brito] :: Deteniendo API...')
        process.exit(1)
    });*/
});