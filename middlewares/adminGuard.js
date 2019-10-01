const jwt = require('bcryptjs');
const SEED = require('../config/config').SEED;

exports.verificaAdmin = function(req, res, next) {

  const token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) res.status(401).json({ ok: false, msg: 'Token incorrecto', Errors: err });

    if (decoded.usuario.role = 'ADMIN_ROLE') {
      next();
      return;
    } else {
      return res.status(400).json({ ok: false, msg: 'Tokn incorrecto' });
    }
  });
}

exports.verificaMismoUsuario = function(req, res, next) {

  const usuario = req.usuario;
  const id = req.params.id;

  if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
    next();
    return;
  } else {
    return res.status(400).json({ ok: false, msg: 'Tokn incorrecto - ni mismo user' });
  }

}