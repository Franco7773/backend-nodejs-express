const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

const verificaToken = require('../middlewares/authentication').verificaToken;

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
      ID: usuarioDB._id,
      usuario: usuarioDB,
      token,
      menu: obtenerMenu( usuarioDB.role )    
    });
  });
});



app.get('/renewtoken', verificaToken, (req, res) => {

  const token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: '48h' });
  
  res.status(200).json({
    ok: true,
    token
  });
});


// GOOGLE SIGN IN ******************************************************
const CLIENT_ID = require('../config/configGG').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify( tokenGG ) {
  const ticket = await client.verifyIdToken({
      idToken: tokenGG,
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
  const googleUser = await verify( tokenGG ).then( userGG => userGG).catch( err => {
    res.status(403).json({ ok: false, msg: 'TokenGG no valido', Errors: err });
  });
  // console.log(googleUser);
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) res.status(500).json({ ok: false, msg: 'Error al buscar usuario', Errors: err });

    if (usuarioDB) {
      if (!usuarioDB.google) res.status(400).json({ ok: false, msg: 'Debe de usar su autenticación normar' });
      else {
        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: '48h' });

        res.json({
          ok: true,
          ID: usuarioDB._id,
          usuario: usuarioDB,
          token,
          menu: obtenerMenu( usuarioDB.role )
        });
      }
    } else {// El usuario no existe, hay que crearlo
      // console.log(googleUser);
      const { name: nombre, email, password = '=(', img, google = true } = googleUser
      const usuario = new Usuario({ nombre, email, password, img, google });
      
      usuario.save( (err, usuarioGuardado) => {
        if (err) res.status(500).json({ ok: false, msg: 'Error al guardar usuarioGG en DB', Errors: err });

        const token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: '48h' });
        usuarioGuardado['password'] = '=)';
        
        res.json({
          ok: true,
          ID: usuarioGuardado._id,
          usuario: usuarioGuardado,
          token,
          menu: obtenerMenu( usuarioGuardado.role )
        });
      });
    }
  });
});

function obtenerMenu( ROLE ) {

  const menu = [
    {
      titulo: 'Principal',
      icono: 'mdi mdi-gauge',
      submenu: [
        { titulo: 'Dashboard', url: '/dashboard' },
        { titulo: 'ProgressBar', url: '/progress' },
        { titulo: 'Gráficas', url: '/grafica1' },
        { titulo: 'Promesas', url: '/promesas' },
        { titulo: 'RxJs', url: '/rxjs' }
      ]
    },
    {
      titulo: 'Mantenimientos',
      icono: 'mdi mdi-folder-lock-open',
      submenu: [
        // { titulo: 'Usuarios', url: '/usuarios' },
        { titulo: 'Clinicas', url: '/clinicas' },
        { titulo: 'Médicos', url: '/medicos' }
      ]
    }
  ];

  if (ROLE === 'ADMIN_ROLE') {
    menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios' } );
  }
  return menu;
}

module.exports = app;
