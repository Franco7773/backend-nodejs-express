const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Parse application/x-www-form-urlencode
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
// const appRoutes = 
app.use(require('./routes/routes'));

mongoose.connection.openUri('mongodb://localhost:27017/ClinicDB', (err, res) => {

	if (err) throw new Error(err);

	console.log('DB Online');
});



app.listen(3777, () => console.log('Server port 3777 Online'));
