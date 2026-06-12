const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const transaksiSchema = new mongoose.Schema(
  {
    id_transaksi: { type: String, required: true, unique: true, default: () => generateId('TRX') },
    id_tabungan: { type: String, required: true },
    id_jamaah: { type: String, required: true },
    tanggal_bayar: { type: Date, default: Date.now },
    total_bayar: { type: Number, required: true },
    metode_bayar: { type: String, required: true },
    jenis_transaksi: { type: String, enum: ['tunai', 'cicil'], required: true },
    bukti_pembayaran: { type: String, default: '' },
    status_pembayaran: { type: String, enum: ['pending', 'success', 'failed'], default: 'success', required: true },
    // Field integrasi payment gateway (opsional, tidak melanggar validator $jsonSchema)
    nomor_referensi: { type: String, index: true, sparse: true },
    kode_bayar: { type: String, default: '' },
    kadaluarsa: { type: Date },
  },
  { collection: 'transaksi', timestamps: true }
);

module.exports = mongoose.model('Transaksi', transaksiSchema);
