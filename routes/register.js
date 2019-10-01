const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const Usuario = require('../models/usuario');

router.post('/', (req, res) => {
  
  req.body.password = bcrypt.hashSync(req.body.password, 11);
  const usuario = new Usuario( { nombre, email, password, img, role } = req.body );
  
  usuario.save( (err, usuarioGuardado) => {
    if (err) res.status(400).json({ ok: false, msg: 'Error al crear usuario', errors: err});

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado
    });
  });
});
