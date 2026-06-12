const Transaksi = require('../models/Transaksi');
const Jamaah = require('../models/Jamaah');
const TabunganQurban = require('../models/TabunganQurban');
const KelompokQurban = require('../models/KelompokQurban');
const { ok, asyncHandler } = require('../utils/response');

// Tier perayaan ala pengumuman global game online — ditentukan nominal/jenis.
function tentukanTier(transaksi) {
  if (transaksi.jenis_transaksi === 'tunai') return 'legendary'; // lunas sekaligus
  if (transaksi.total_bayar >= 2000000) return 'epic';
  if (transaksi.total_bayar >= 750000) return 'rare';
  return 'common';
}

// GET /api/broadcast/pembayaran — pembayaran sukses terbaru (48 jam) untuk
// running text global di semua dashboard (jamaah, admin, kepala admin).
exports.pembayaranTerbaru = asyncHandler(async (req, res) => {
  const sejak = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const list = await Transaksi.find({
    status_pembayaran: 'success',
    tanggal_bayar: { $gte: sejak },
  })
    .sort({ tanggal_bayar: -1 })
    .limit(10)
    .lean();

  const enriched = await Promise.all(
    list.map(async (trx) => {
      const [jamaah, tabungan] = await Promise.all([
        Jamaah.findOne({ id_jamaah: trx.id_jamaah }).select('nama_lengkap').lean(),
        TabunganQurban.findOne({ id_tabungan: trx.id_tabungan }).lean(),
      ]);
      const kelompok = tabungan
        ? await KelompokQurban.findOne({ id_kelompok: tabungan.id_kelompok })
            .select('nomor_kelompok')
            .lean()
        : null;
      return {
        id_transaksi: trx.id_transaksi,
        nama_jamaah: jamaah?.nama_lengkap || 'Jamaah',
        total_bayar: trx.total_bayar,
        jenis_transaksi: trx.jenis_transaksi,
        nomor_kelompok: kelompok?.nomor_kelompok || '-',
        tanggal_bayar: trx.tanggal_bayar,
        tier: tentukanTier(trx),
      };
    })
  );
  ok(res, enriched);
});
