const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const clinicaSchema = new Schema({
  nombre: {
    type: String, required: [true, 'El nombre es necesario']
  },
  img: {
    type: String, required: false
  },
  usuario: {
    type: Schema.Types.ObjectId, ref: 'Usuario'
  }
}, { collection: 'clinicas' });

module.exports = mongoose.model('Clinica', clinicaSchema);
