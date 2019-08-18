const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload());

const Clinica = require('../models/clinica');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

app.put('/:tipo/:id', (req, res) => {

  const tipo = req.params.tipo,
        id = req.params.id,
        img = req.files.img;

  const tiposValidos = ['clinicas', 'medicos', 'usuarios'];
  if (tiposValidos.indexOf( tipo ) < 0) res.status(400).json({ ok: false, msg: 'Sólo se permiten subidas en: ' + tiposValidos.join(', ')});

  if (!img) res.status(400).json({ ok: false, Error: 'No selecciono nada' })

  // Obtener nombre del archivo
  let tipoDeArchivo = img.name.split('.'),
      extensionArchivo = tipoDeArchivo[tipoDeArchivo.length - 1];
  // Sólo aceptamos este tipo de extensiones
  extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) res.status(400).json({ ok: false, Error: `El archivo debe de ser ${ extensionesValidas.join(', ') }` });

  // Nombre de archivo personalizado: 48451511514-357.png
  const nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

  const path = `./uploads/${ tipo }/${ nombreArchivo }`;
  
  img.mv( path, err => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al mover archivo', Errors: err });

    switch (tipo) {
      case 'clinicas':
        subirPorTipo(Clinica, id, nombreArchivo, res, tipo);
        break;
      case 'medicos':
        subirPorTipo(Medico, id, nombreArchivo, res, tipo);
        break;
      case 'usuarios':
        subirPorTipo(Usuario, id, nombreArchivo, res, tipo);
        break;
      default:
        return res.status(400).json({ ok: false, msg: 'Los tipos de busqueda sólo son: usuarios, médicos y clinicas' });
    }
  });
});

function subirPorTipo( tipoDB, id, nombreArchivo, res, tipoString) {

  tipoDB.findById( id, (err, resDB) => {
    if (err) res.status(500).json({ ok: false, msg: `${ tipoString } no encontrados`, Errors: err });
    if (!resDB) res.status(400).json({ ok: false, msg: `ID: ${ id } no existe` });

    const pathViejo = `./uploads/${ tipoString }/${ resDB.img }`;

    // Si existe, entonces elimina la imagen anterior
    if (fs.existsSync(pathViejo)) fs.unlinkSync(pathViejo);

    resDB.img = nombreArchivo;
    resDB.save( (err, resGuardada) => {
      if (err) res.status(500).json({ ok: false, msg: `Error al guardar path en: ${ tipoString }` });

      tipoString = tipoString.substring(0, tipoString.length - 1);
      resGuardada.password = '=)';
      
      res.json({
        ok: true,
        msg: 'Imagen subida exitosamente',
        [tipoString]: resGuardada
      });
    });
  });
}

module.exports = app;
