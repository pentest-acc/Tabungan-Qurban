const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const permintaanSchema = new mongoose.Schema(
  {
    id_permintaan: { type: String, required: true, unique: true, default: () => generateId('REQ') },
    id_kelompok: { type: String, required: true },
    id_jamaah: { type: String, required: true },
    catatan: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'diterima', 'ditolak'], default: 'pending' },
    tanggal_pengajuan: { type: Date, default: Date.now },
  },
  { collection: 'permintaan_gabung', timestamps: true }
);

module.exports = mongoose.model('PermintaanGabung', permintaanSchema);
