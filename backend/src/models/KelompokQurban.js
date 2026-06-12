const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const kelompokSchema = new mongoose.Schema(
  {
    id_kelompok: { type: String, required: true, unique: true, default: () => generateId('KLP') },
    id_sapi: { type: String, required: true },
    nomor_kelompok: { type: String, required: true, trim: true },
    tanggal_mulai: { type: Date, required: true },
    tanggal_berakhir: { type: Date, required: true },
    status: { type: String, enum: ['Aktif', 'Penuh', 'Expired'], default: 'Aktif' },
  },
  { collection: 'kelompok_qurban', timestamps: true }
);

module.exports = mongoose.model('KelompokQurban', kelompokSchema);
