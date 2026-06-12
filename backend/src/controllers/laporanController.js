const Jamaah = require('../models/Jamaah');
const Admin = require('../models/Admin');
const SapiQurban = require('../models/SapiQurban');
const KelompokQurban = require('../models/KelompokQurban');
const TabunganQurban = require('../models/TabunganQurban');
const Transaksi = require('../models/Transaksi');
const { lengkapiSemuaKelompok } = require('../services/kelompokService');
const { ok, asyncHandler } = require('../utils/response');

// GET /api/laporan/ringkasan — statistik keseluruhan sistem
exports.ringkasan = asyncHandler(async (req, res) => {
  const [totalJamaah, totalAdmin, totalSapi, totalKelompok, totalTransaksi, danaAgg, tabunganAgg] =
    await Promise.all([
      Jamaah.countDocuments(),
      Admin.countDocuments(),
      SapiQurban.countDocuments(),
      KelompokQurban.countDocuments(),
      Transaksi.countDocuments({ status_pembayaran: 'success' }),
      Transaksi.aggregate([
        { $match: { status_pembayaran: 'success' } },
        { $group: { _id: null, total: { $sum: '$total_bayar' } } },
      ]),
      TabunganQurban.aggregate([
        {
          $group: {
            _id: null,
            total_terkumpul: { $sum: '$total_terkumpul' },
            sisa_tagihan: { $sum: '$sisa_tagihan_kelompok' },
          },
        },
      ]),
    ]);

  const statusKelompok = await KelompokQurban.aggregate([
    { $group: { _id: '$status', jumlah: { $sum: 1 } } },
  ]);

  ok(res, {
    total_jamaah: totalJamaah,
    total_admin: totalAdmin,
    total_sapi: totalSapi,
    total_kelompok: totalKelompok,
    total_transaksi: totalTransaksi,
    total_dana: danaAgg[0]?.total || 0,
    total_tabungan_terkumpul: tabunganAgg[0]?.total_terkumpul || 0,
    total_sisa_tagihan: tabunganAgg[0]?.sisa_tagihan || 0,
    kelompok_per_status: Object.fromEntries(statusKelompok.map((s) => [s._id, s.jumlah])),
  });
});

// GET /api/laporan/kelompok — progres tabungan per kelompok
exports.perKelompok = asyncHandler(async (req, res) => {
  const list = await KelompokQurban.find().sort({ createdAt: -1 }).lean();
  ok(res, await lengkapiSemuaKelompok(list));
});
