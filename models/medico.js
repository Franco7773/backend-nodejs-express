const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicoSchema = new Schema({
  nombre: {
    type: String, required: [true, 'El nombre es necesario']
  },
  usuario: {
    type: Schema.Types.ObjectId, ref: 'Usuario', required: true
  },
  clinica: {
    type: Schema.Types.ObjectId, ref: 'Clinica', required: [true, 'El ID de la clinica es un campo obligatorio']
  },
  img: {
    type: String, required: false
  }
});

module.exports = mongoose.model('Medico', medicoSchema);
