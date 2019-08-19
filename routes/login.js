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
    usuarioDB.password = '=)';
    const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: '48h' });
    
    res.json({
      ok: true,
      id_user: usuarioDB._id,
      usuario: usuarioDB,
      token
    });
  });
});


// GOOGLE SIGN IN ******************************************************

const CLIENT_ID = require('../config/configGG').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return { name: nombre, email, picture: img, google = true } = payload;
}

app.post('/google', async (req, res) => {

  const tokenGG = req.body.tokenGG
  const googleUser = await verify( tokenGG ).catch( err => {
    res.status(403).json({ ok: false, msg: 'TokenGG no valido', Errors: err });
  });
  
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al buscar usuario', Errors: err });

    if (usuarioDB) {
      if (!usuarioDB.google) res.status(400).json({ ok: false, msg: 'Debe de usar su autenticación normar' });
      else {
        const token = jwt.sign({ usuario: googleUser }, SEED, { expiresIn: '48h' });

        res.json({
          ok: true,
          ID: usuarioDB._id,
          usuarioDB,
          token
        });
      }
    } else {// El usuario no existe, hay que crearlo
      const usuario = new Usuario({ nombre, email, password = '=(', img, google } = googleUser);
      
      usuario.save( (err, usuarioGuardado) => {
        if (err) res.status(500).json({ ok: false, msg: 'Error al guardar usuarioGG en DB', Errors: err });

        const token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: '48h' });
        usuarioGuardado.password = '=)';
        
        res.json({
          ok: true,
          ID: usuarioGuardado._id,
          usuario: usuarioGuardado,
          token
        });
      });
    }
  });
});

module.exports = app;
