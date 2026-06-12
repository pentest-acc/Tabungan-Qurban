const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const sapiSchema = new mongoose.Schema(
  {
    id_sapi: { type: String, required: true, unique: true, default: () => generateId('SPI') },
    penanda_sapi: { type: String, required: true, trim: true },
    bobot_estimasi: { type: Number, required: true },
    harga_sapi: { type: Number, required: true, default: 23800000 },
    harga_porsi: { type: Number, required: true, default: 3400000 },
  },
  { collection: 'sapi_qurban', timestamps: true }
);

module.exports = mongoose.model('SapiQurban', sapiSchema);
