const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

const SEED = require('../config/config').SEED;

const Usuario = require('../models/usuario');

app.post('/', (req, res) => {

  const body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

    if (err) res.status(500).json({ ok: false, msg: 'Error al buscar usuarios', errors: err });
    if (!usuarioDB) res.status(400).json({ ok: false, msg: 'Email - Credenciales incorrectas' });
  
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) res.status(400).json({ ok: false, msg: 'Clave - Credenciales incorrectas' });
    
    // crear Token
    const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: '48h' });
    usuarioDB.password = '=)'
    
    res.json({
      ok: true,
      id_user: usuarioDB._id,
      usuario: usuarioDB,
      token
    });
  });
});

module.exports = app;
