const express = require('express');
const app = express();


app.get('/', (req, res) => {

	res.status(200).json({
		ok: true,
		msj: 'Petición realizada correctamente'
	});
});

module.exports = app;
