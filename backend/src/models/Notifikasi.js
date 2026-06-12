const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const notifikasiSchema = new mongoose.Schema(
  {
    id_notifikasi: { type: String, required: true, unique: true, default: () => generateId('NTF') },
    id_jamaah: { type: String, required: true, index: true },
    judul: { type: String, required: true },
    pesan: { type: String, required: true },
    tipe: { type: String, enum: ['kelompok', 'pembayaran', 'umum'], default: 'umum' },
    dibaca: { type: Boolean, default: false },
  },
  { collection: 'notifikasi', timestamps: true }
);

module.exports = mongoose.model('Notifikasi', notifikasiSchema);
