const express = require('express');
const app = express();

app.use('/usuario', require('./usuario'));
app.use('/login', require('./login'));
app.use('/', require('./app'));

module.exports = app;
