const express = require('express');
const bcrypt = require('bcryptjs');
const verificaToken = require('../middlewares/authentication').verificaToken;

const app = express();


const Usuario = require('../models/usuario');


// ******************************* OBTENER USUARIOS ******************************************
app.get('/', (req, res) => {

  Usuario.find({ }, 'nombre email img role').exec((err, usuarios) => {

    if (err) res.status(500).json({ ok: false, msg: 'Error cargando usuarios', errors: err });

    res.json({
      ok: true,
      usuarios
    });
  });
});


// ******************************* ACTUALIZAR USUARIOS ******************************************
app.put('/:id', verificaToken, (req, res) => {

  const id = req.params.id
  const { nombre, email, role } = req.body;

  Usuario.findById( id, 'nombre email role').exec((err, usuarioDB) => {

    if (err) res.status(500).json({ ok: false, msg: 'Error al buscar usuario', err });

    if (!usuarioDB) res.status(400).json({ ok: false, msg: `El usuario con el id ${ id } no existe`, err: { message: `El usuario con el id ${ id } no existe`}}); 


    usuarioDB.nombre = nombre;
    usuarioDB.email = email;
    usuarioDB.role = role;

    usuarioDB.save( (err, usuarioGuardado) => {
      if (err) res.status(400).json({ ok: false, msg: 'Error al actualizar usuario', errors: err });

      usuarioGuardado.password = '=)';
      
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        solicitadoPor: req.usuario
      });
    });
  });
});


// ******************************* CREAR USUARIOS ***********************************************
app.post('/', verificaToken, (req, res) => {
  
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


// ******************************* ELIMINAR USUARIOS ***********************************************
app.delete('/:id', verificaToken, (req, res) => {

  const id = req.params.id;
  
  Usuario.findByIdAndRemove( id, (err, usuarioBorrado) => {
    
    if (err) res.status(500).json({ ok: false, msg: 'Error al borrar usuario', errors: err });

    if (!usuarioBorrado) res.status(400).json({ ok: false, msg: `No existe un usuario con ID: ${ id }`, errors: { message: `No existe un usuario con ID: ${ id }`}});

    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    });
  });  
});

module.exports = app;
