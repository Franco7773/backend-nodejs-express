const express = require('express');
const verificaToken = require('../middlewares/authentication').verificaToken;

const app = express();

const Medico = require('../models/medico');
const Clinica = require('../models/clinica');


app.get('/', (req, res) => {

  const desde = Number(req.query.desde) || 0,
        hasta = Number(req.query.hasta) || 5;

  Medico.find({ }).populate('usuario', 'nombre email').populate('clinica').skip(desde).limit(hasta).exec((err, medicosDB) => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al buscar medicos', errors: err });

    Medico.count({}, (err, conteo) => {
      if (err) res.status(500).json({ ok: false, msg: 'Error al calcular el total de medicos', errors: err });

      res.json({
        ok: true,
        medicos: medicosDB,
        toal: conteo
      });
    });
  });
});



app.put('/:id', verificaToken, (req, res) => {

  const id = req.params.id;
  let { nombre, clinica } = req.body;

  Medico.findById( id, (err, medicoDB) => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al actualizar medico', errors: err });

    if (!medicoDB) res.status(400).json({ ok: false, msg: `El medico con ID ${ id } no existe` });

    Clinica.find({ nombre: clinica }, (err, clinicaDB) => {
      if (err) res.status(500).json({ ok: false, msg: 'Error al buscar clinica', errors: err });

      if (!clinicaDB) res.status(400).json({ ok: false, msg: `La clinica ${ clinica } no fue localizada` });

      clinica = clinicaDB[0]._id;
      
      medicoDB.nombre = nombre;
      medicoDB.usuario = req.usuario._id;
      medicoDB.clinica = clinica;

      medicoDB.save( (err, medicoModificado) => {
        if (err) res.status(500).json({ ok: false, msg: 'Error al intentar modificar medico', errors: err });

        if (!medicoModificado) res.status(400).json({ ok: false, msg: `Error al guardar medico con ID ${ id } en DB` });
        
        res.json({
          ok: true,
          medico: medicoModificado,
          solicitadoPor: req.usuario
        });
      });
    });
  });
});



app.post('/', verificaToken, (req, res) => {

  const usuario = req.usuario._id;
  let { nombre, clinica } = req.body;

  Clinica.find({ nombre: clinica }, (err, clinicaDB) => {
    if (err) res.status(400).json({ ok: false, msg: 'Error al buscar clinica', errors: err });

    clinica = clinicaDB[0]._id;

    // return res.json({ id: clinicaDB[0]._id });

    const medico = new Medico({ nombre, usuario, clinica });

    medico.save( (err, medicoGuardado) => {
      if (err) res.status(500).json({ ok: false, msg: 'Error al intentar crear medico', errors: err });

      if (!medicoGuardado) res.status(400).json({ ok: false, msg: `No se pudo crear al medico ${ nombre }` });

      res.status(201).json({
        ok: true,
        msg: 'Medico creado exitosamente',
        medico: medicoGuardado,
        solicitadoPor: req.usuario
      });
    });
  });
});



app.delete('/:id', verificaToken, (req, res) => {

  const id = req.params.id;

  Medico.findByIdAndRemove( id, (err, medicoBorrado) => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al intentar borrar', errors: err });

    if (!medicoBorrado) res.status(400).json({ ok: false, msg: `Error al borrar al medico con ID ${ id }` });

    res.json({
      ok: true,
      msg: 'Medico eliminado exitosamente',
      medico: medicoBorrado,
      solicitadoPor: req.usuario
    });
  });
});

module.exports = app;
