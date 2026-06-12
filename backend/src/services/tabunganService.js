const TabunganQurban = require('../models/TabunganQurban');
const KelompokQurban = require('../models/KelompokQurban');
const SapiQurban = require('../models/SapiQurban');
const DetailKelompok = require('../models/DetailKelompok');
const Transaksi = require('../models/Transaksi');
const { ApiError } = require('../utils/response');

// Buat tabungan otomatis saat kelompok dibuat (relasi 1:1).
// Target = harga sapi; sisa tagihan awal = harga sapi.
async function buatTabunganOtomatis(kelompok) {
  const sapi = await SapiQurban.findOne({ id_sapi: kelompok.id_sapi });
  return TabunganQurban.create({
    id_kelompok: kelompok.id_kelompok,
    total_terkumpul: 0,
    sisa_tagihan_kelompok: sapi ? sapi.harga_sapi : 0,
  });
}

// Catat pembayaran: tambah total terkumpul, kurangi sisa tagihan kelompok.
async function catatPembayaran(idTabungan, jumlah) {
  const tabungan = await TabunganQurban.findOne({ id_tabungan: idTabungan });
  if (!tabungan) throw new ApiError('Tabungan tidak ditemukan', 404);
  tabungan.total_terkumpul += jumlah;
  tabungan.sisa_tagihan_kelompok = Math.max(0, tabungan.sisa_tagihan_kelompok - jumlah);
  await tabungan.save();
  return tabungan;
}

// Batalkan pembayaran (refund / transaksi dihapus): kebalikan catatPembayaran.
async function batalkanPembayaran(idTabungan, jumlah) {
  const tabungan = await TabunganQurban.findOne({ id_tabungan: idTabungan });
  if (!tabungan) return null;
  tabungan.total_terkumpul = Math.max(0, tabungan.total_terkumpul - jumlah);
  tabungan.sisa_tagihan_kelompok += jumlah;
  await tabungan.save();
  return tabungan;
}

// Susun ringkasan tabungan + tagihan pribadi seorang jamaah.
async function ringkasanTabunganJamaah(idJamaah) {
  const detail = await DetailKelompok.findOne({ id_jamaah: idJamaah }).sort({ createdAt: -1 });
  if (!detail) return null;

  const kelompok = await KelompokQurban.findOne({ id_kelompok: detail.id_kelompok }).lean();
  const tabungan = await TabunganQurban.findOne({ id_kelompok: detail.id_kelompok }).lean();
  if (!kelompok || !tabungan) return null;

  const sapi = await SapiQurban.findOne({ id_sapi: kelompok.id_sapi }).lean();
  const hargaPorsi = sapi ? sapi.harga_porsi : 3400000;

  const transaksiSaya = await Transaksi.find({
    id_tabungan: tabungan.id_tabungan,
    id_jamaah: idJamaah,
    status: 'sukses',
  }).lean();
  const totalDibayar = transaksiSaya.reduce((sum, t) => sum + t.total_bayar, 0);

  return {
    ...tabungan,
    kelompok: { ...kelompok, sapi },
    nomor_kelompok: kelompok.nomor_kelompok,
    tanggal_berakhir: kelompok.tanggal_berakhir,
    harga_porsi: hargaPorsi,
    total_dibayar: totalDibayar,
    sisa_tagihan_pribadi: Math.max(0, hargaPorsi - totalDibayar),
  };
}

module.exports = { buatTabunganOtomatis, catatPembayaran, batalkanPembayaran, ringkasanTabunganJamaah };
