const Transaksi = require('../models/Transaksi');
const TabunganQurban = require('../models/TabunganQurban');
const DetailKelompok = require('../models/DetailKelompok');
const Jamaah = require('../models/Jamaah');
const { catatPembayaran, batalkanPembayaran } = require('../services/tabunganService');
const { uploadBuffer, isConfigured } = require('../config/cloudinary');
const { ok, ApiError, asyncHandler } = require('../utils/response');

async function sertakanNamaJamaah(list) {
  return Promise.all(
    list.map(async (trx) => {
      const jamaah = await Jamaah.findOne({ id_jamaah: trx.id_jamaah })
        .select('id_jamaah nama_lengkap username')
        .lean();
      return { ...trx, jamaah, nama_jamaah: jamaah?.nama_lengkap };
    })
  );
}

// GET /api/transaksi — monitoring seluruh transaksi (admin)
exports.getAll = asyncHandler(async (req, res) => {
  const { jenis, status } = req.query;
  const filter = {};
  if (jenis) filter.jenis_transaksi = jenis;
  if (status) filter.status_pembayaran = status;
  const list = await Transaksi.find(filter).sort({ tanggal_bayar: -1 }).lean();
  ok(res, await sertakanNamaJamaah(list));
});

// GET /api/transaksi/saya — riwayat transaksi jamaah yang login
exports.getMine = asyncHandler(async (req, res) => {
  const list = await Transaksi.find({ id_jamaah: req.user.id_jamaah })
    .sort({ tanggal_bayar: -1 })
    .lean();
  ok(res, list);
});

// GET /api/transaksi/:id
exports.getById = asyncHandler(async (req, res) => {
  const trx = await Transaksi.findOne({ id_transaksi: req.params.id }).lean();
  if (!trx) throw new ApiError('Transaksi tidak ditemukan', 404);
  const [enriched] = await sertakanNamaJamaah([trx]);
  ok(res, enriched);
});

// POST /api/transaksi/bayar — jamaah menyetor dana (simulasi webhook payment gateway)
// Mendukung multipart (field "bukti") untuk upload bukti pembayaran ke Cloudinary.
exports.bayar = asyncHandler(async (req, res) => {
  const { id_tabungan, metode_bayar, jenis_transaksi } = req.body;
  const totalBayar = Number(req.body.total_bayar);

  const tabungan = await TabunganQurban.findOne({ id_tabungan });
  if (!tabungan) throw new ApiError('Tabungan tidak ditemukan', 404);

  // Pastikan jamaah adalah anggota kelompok pemilik tabungan ini.
  const anggota = await DetailKelompok.exists({
    id_kelompok: tabungan.id_kelompok,
    id_jamaah: req.user.id_jamaah,
  });
  if (!anggota) throw new ApiError('Anda bukan anggota kelompok tabungan ini', 403);

  // Upload bukti pembayaran jika dikirim; jika Cloudinary tidak dikonfigurasi,
  // gunakan bukti otomatis dari "payment gateway".
  let buktiUrl = '';
  if (req.file && isConfigured()) {
    buktiUrl = await uploadBuffer(req.file.buffer);
  }

  const trx = await Transaksi.create({
    id_tabungan,
    id_jamaah: req.user.id_jamaah,
    total_bayar: totalBayar,
    metode_bayar,
    jenis_transaksi,
    bukti_pembayaran: buktiUrl,
    status_pembayaran: 'success',
  });

  // "Trigger" otomatis: update saldo tabungan kelompok.
  const tabunganBaru = await catatPembayaran(id_tabungan, totalBayar);
  ok(res, { transaksi: trx, tabungan: tabunganBaru }, 'Pembayaran berhasil dicatat', 201);
});

// PUT /api/transaksi/:id/status — admin koreksi status pembayaran
// Mengubah success -> failed akan mengembalikan saldo tabungan, dan sebaliknya.
exports.updateStatus = asyncHandler(async (req, res) => {
  const trx = await Transaksi.findOne({ id_transaksi: req.params.id });
  if (!trx) throw new ApiError('Transaksi tidak ditemukan', 404);

  const statusBaru = req.body.status;
  if (trx.status_pembayaran === statusBaru) return ok(res, trx, 'Status tidak berubah');

  if (trx.status_pembayaran === 'success' && statusBaru !== 'success') {
    await batalkanPembayaran(trx.id_tabungan, trx.total_bayar);
  } else if (trx.status_pembayaran !== 'success' && statusBaru === 'success') {
    await catatPembayaran(trx.id_tabungan, trx.total_bayar);
  }

  trx.status_pembayaran = statusBaru;
  await trx.save();
  ok(res, trx, 'Status transaksi berhasil diperbarui');
});

// DELETE /api/transaksi/:id — pembatalan transaksi / refund (admin)
exports.remove = asyncHandler(async (req, res) => {
  const trx = await Transaksi.findOne({ id_transaksi: req.params.id });
  if (!trx) throw new ApiError('Transaksi tidak ditemukan', 404);

  if (trx.status_pembayaran === 'success') {
    await batalkanPembayaran(trx.id_tabungan, trx.total_bayar);
  }
  await trx.deleteOne();
  ok(res, null, 'Transaksi dibatalkan dan saldo tabungan dikembalikan');
});
