const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
// const serveIndex = require('serve-index');

const app = express();


// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // update to match the domain you will make the request from
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
});

// Peticiones
app.use(morgan('dev'));

// Parse application/x-www-form-urlencode
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server index config
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Routes
app.use(require('./routes/routes'));

mongoose.connection.openUri('mongodb://localhost:27017/ClinicDB', (err, res) => {

	if (err) throw new Error(err);

	console.log('DB Online');
});



app.listen(3777, () => console.log('Server port 3777 Online'));
