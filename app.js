const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connection.openUri('mongodb://localhost:27017/ClinicDB', (err, res) => {

	if (err) throw new Error(err);

	console.log('DB Online');
});

app.get('/', (req, res) => {

	res.status(200).json({
		ok: true,
		msj: 'Petición realizada correctamente'
	})
})

app.listen(3777, () => console.log('Server port 3777 Online'));
