const express = require('express');
const app = express();

const Clinica = require('../models/clinica');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

app.get('/todo/:buscar', (req, res) => {

  const buscar = req.params.buscar;
  const regExp = new RegExp( buscar, 'i' );

  Promise.all( [buscarClinicas( regExp ), buscarMedicos( regExp ), buscarUsuarios( regExp )] ).then( busquedas => {

    res.json({
      ok: true,
      clinicas: busquedas[0],
      medicos: busquedas[1],
      usuarios: busquedas[2]
    });
  });
});

app.get('/coleccion/:tabla/:buscar', (req, res) => {

  const tabla = req.params.tabla,
        buscar = req.params.buscar,
        regExp = new RegExp(buscar, 'i');

  var promesa;

  switch (tabla) {
    case 'clinicas':
      promesa = buscarClinicas( regExp );
      break;
    case 'medicos':
      promesa = buscarMedicos( regExp );
      break;
    case 'usuarios':
      promesa = buscarUsuarios( regExp );
      break;
    default:
      return res.status(400).json({ ok: false, msg: 'Los tipos de busqueda sólo son: usuarios, médicos y clinicas' });
  }

  promesa.then( dataDB => 
    res.json({
      ok: true,
      [tabla]: dataDB
    })
  ).catch( err => res.status(400).json({ ok: false, msg: `Error switch-${ tabla }`, errors: err }));
});

function buscarClinicas( regExp) {
  return new Promise( (resolve, reject) => {

    Clinica.find({ nombre: regExp }).populate('usuario', 'nombre email').exec((err, clinicasDB) => {
      if (err) reject('Error al buscar las clinicas', err);
      else if (!clinicasDB) reject('La clinica no existe');
      else resolve(clinicasDB);
    });
  })
}

function buscarMedicos( regExp ) {
  return new Promise( (resolve, reject) => {

    Medico.find({ nombre: regExp }).populate('usuario', 'nombre email').populate('clinica').exec((err, medicosDB) => {
      if (err) reject('Error al buscar los medicos', err)
      else if (!medicosDB) reject('El médico no existe')
      else resolve( medicosDB );
    });
  });
}

function buscarUsuarios( regExp ) {
  return new Promise( (resolve, reject) => {
    
    Usuario.find({}, 'nombre email role').or( [{ nombre: regExp}, { email: regExp }] ).exec( (err, usuariosDB) => {
      if (err) reject('Error al buscar los usuarios', err)
      else if (!usuariosDB) reject('El usuario no existe')
      else resolve(usuariosDB);
    });
  });
}


module.exports = app;
