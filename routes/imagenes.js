const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.get('/:tipo/:img', (req, res) => {

  const tipo = req.params.tipo,
        img = req.params.img;

  const pathImage = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
  const noImage = path.resolve(__dirname, '../assets/no-img.jpg');

  if (fs.existsSync(pathImage)) res.sendFile(pathImage);
  else res.sendFile(noImage);
});

module.exports = app;
