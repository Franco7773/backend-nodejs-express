const SEED = require('../config/config').SEED;
const jwt = require('jsonwebtoken');

exports.verificaToken = function(req, res, next) {
// ******************************* VERIFICAR TOKEN ******************************************
  const token = req.query.token

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) res.status(401).json({ ok: false, msg: 'Token no válido', errors: err });

    decoded.usuario.password = '=)';
    req.usuario = decoded.usuario;
    // res.json({
    //   ok: true,
    //   usuario: decoded
    // });
  });
  next();
};

