const express = require('express');
const app = express();

app.use('/usuario', require('./usuario'));
app.use('/login', require('./login'));
app.use('/clinica', require('./clinica'));
app.use('/medico', require('./medico'));
app.use('/busqueda', require('./busqueda'));
app.use('/upload', require('./upload'));
app.use('/imagenes', require('./imagenes'));
app.use('/', require('./app'));

module.exports = app;
