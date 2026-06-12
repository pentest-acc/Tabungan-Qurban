const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const tabunganSchema = new mongoose.Schema(
  {
    id_tabungan: { type: String, required: true, unique: true, default: () => generateId('TAB') },
    id_kelompok: { type: String, required: true, unique: true },
    total_terkumpul: { type: Number, required: true, default: 0 },
    sisa_tagihan_kelompok: { type: Number, required: true, default: 0 },
  },
  { collection: 'tabungan_qurban', timestamps: true }
);

module.exports = mongoose.model('TabunganQurban', tabunganSchema);
