const moment_timezone = require('moment-timezone');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const express = require('express');
const moment = require('moment');

const router = express.Router();

const BCRYPT_SALT_ROUNDS = 12;

router.post("/usuario/insert", async (req, res)=>{
    
    console.log('Entro a /usuario/insert :: ');
    
    const password = bcrypt.hashSync(req.body.password, BCRYPT_SALT_ROUNDS);

    const usuarios = new Usuario(
    {
        usuario : req.body.usuario,
        password : password,
        nombre : req.body.nombre,
        perfil : req.body.perfil
    });

    console.log(usuarios);    

    const result = await usuarios.save()
    res.status(201).send(result);
});

router.post("/usuario/login", async (req, res)=>{
    console.log('Entro a /usuario/login');
    
    var payload = { "usuario": req.body.usuario };

    const usuario = await Usuario.find(payload);
    if (usuario.length < 1) return res.status(200).send('NOK');

    if (!bcrypt.compareSync(req.body.password, usuario[0].password)) return res.status(200).send('NOK contraseña');

    const result = {
        "nombre" : usuario[0].nombre,
        "perfil" : usuario[0].perfil,
        "status" : usuario[0].status
    }
    
    res.status(200).send(result);
});

module.exports = router;