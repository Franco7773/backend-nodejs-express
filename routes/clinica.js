const express = require('express');
const verificaToken = require('../middlewares/authentication').verificaToken;

const app = express();

const Clinica = require('../models/clinica');



app.get('/', (req, res) => {

  const desde = Number(req.query.desde) || 0,
        hasta = Number(req.query.hasta) || 5;

  Clinica.find({ }).populate('usuario', 'nombre email').skip(desde).limit(hasta).exec( (err, clinicasDB) => {

    if (err) res.status(500).json({ ok: false, msg: 'Error al tratar de encontrar clinicas', errors: err });

    Clinica.count({}, (err, conteo) => {
      if (err) res.status(500).json({ ok: false, msg: 'Error al calcular el total de clinicas' });

      res.json({
        ok: true,
        clinicas: clinicasDB,
        total: conteo
      });
    });
  });
});



app.get('/:id', (req, res) => {

  const id = req.params.id;
  console.log('Este es el ID de clinica: ' + id);
  Clinica.findById( id ).populate('usuario', 'nombre img email').exec( (err, clinicaDB) => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al buscar clinica', Errors: err });
    if (!clinicaDB) res.status(400).json({ ok: false, msg: `La clinica con el ID: ${ id }, no existe` });

    res.json({
      ok: true,
      clinica: clinicaDB
    });
  });
});



app.put('/:id', verificaToken, (req, res) => {

  const id = req.params.id;
  const { nombre } = req.body;

  Clinica.findById( id, (err, clinicaDB) => {

    if (err) res.status(500).json({ ok: false, msg: 'Error al buscar la clinica', errors: err });

    if (!clinicaDB) res.status(400).json({ ok: false, msg: `No se encontro la clinica ${ id }` })

    clinicaDB.nombre = nombre;
    clinicaDB.usuario = req.usuario._id;

    clinicaDB.save( (err, clinicaActualizada) => {
      if (err) res.status(400).json({ ok: false, msg: 'Error al guardar el cambio', errors: err });

      res.json({
        ok: true,
        clinica: clinicaActualizada,
        solicitadoPor: req.usuario
      });
    });
  });
});



app.post('/', verificaToken, (req, res) => {

  const { nombre } = req.body;

  const clinica = new Clinica({
    nombre,
    usuario: req.usuario._id 
  });

  clinica.save( (err, clinicaGuardada) => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al crear la clinica', errors: err });

    if (!clinicaGuardada) res.status(400).json({ ok: false, msg: 'Por favor vuelve a intentarlo', errors: err });

    res.json({
      ok: true,
      clinica: clinicaGuardada
    });
  });
});



app.delete('/:id', verificaToken, (req, res) => {

  const id = req.params.id;

  Clinica.findByIdAndRemove( id, (err, clinicaBorrada) => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al borrar clinica', errors: err });

    if (!clinicaBorrada) res.status(400).json({ ok: false, msg: `No existe clinica con ID: ${ id }`, errors: err });

    res.json({
      ok: true,
      clinica: clinicaBorrada,
      solicitadoPor: req.usuario
    });
  });
});



module.exports = app;
