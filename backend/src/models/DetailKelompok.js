const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const detailSchema = new mongoose.Schema(
  {
    id_detail: { type: String, required: true, unique: true, default: () => generateId('DTL') },
    id_kelompok: { type: String, required: true },
    id_jamaah: { type: String, required: true },
  },
  { collection: 'detail_kelompok', timestamps: true }
);

// Satu jamaah hanya boleh terdaftar sekali per kelompok.
detailSchema.index({ id_kelompok: 1, id_jamaah: 1 }, { unique: true });

module.exports = mongoose.model('DetailKelompok', detailSchema);
