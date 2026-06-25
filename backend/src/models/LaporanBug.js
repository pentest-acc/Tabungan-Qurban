const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

// Laporan bug / saran dari pengguna ke developer. Koleksi baru (tanpa
// $jsonSchema validator) sehingga aman & fleksibel.
const laporanSchema = new mongoose.Schema(
  {
    id_laporan: { type: String, required: true, unique: true, default: () => generateId('LPR') },
    kategori: { type: String, enum: ['bug', 'saran', 'lainnya'], default: 'lainnya' },
    pesan: { type: String, required: true },
    kontak: { type: String, default: '' },
    id_pengirim: { type: String, default: '' },
    peran_pengirim: { type: String, default: 'tamu' },
    email_terkirim: { type: Boolean, default: false },
  },
  { collection: 'laporan_bug', timestamps: true }
);

module.exports = mongoose.model('LaporanBug', laporanSchema);
