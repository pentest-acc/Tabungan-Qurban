const Jamaah = require('../models/Jamaah');
const Admin = require('../models/Admin');
const SapiQurban = require('../models/SapiQurban');
const KelompokQurban = require('../models/KelompokQurban');
const TabunganQurban = require('../models/TabunganQurban');
const Transaksi = require('../models/Transaksi');
const DetailKelompok = require('../models/DetailKelompok');
const { lengkapiSemuaKelompok } = require('../services/kelompokService');
const { ok, asyncHandler } = require('../utils/response');

// Susun progres pembayaran tiap anggota dalam sebuah kelompok.
async function progresAnggota(kelompok) {
  const hargaPorsi = kelompok.sapi?.harga_porsi ?? 0;
  const idTabungan = kelompok.tabungan?.id_tabungan;
  const details = await DetailKelompok.find({ id_kelompok: kelompok.id_kelompok }).lean();

  return Promise.all(
    details.map(async (detail) => {
      const jamaah = await Jamaah.findOne({ id_jamaah: detail.id_jamaah })
        .select('id_jamaah nama_lengkap username')
        .lean();
      const transaksi = idTabungan
        ? await Transaksi.find({
            id_tabungan: idTabungan,
            id_jamaah: detail.id_jamaah,
            status_pembayaran: 'success',
          }).lean()
        : [];
      const totalDibayar = transaksi.reduce((sum, t) => sum + (t.total_bayar || 0), 0);
      return {
        id_jamaah: detail.id_jamaah,
        nama_lengkap: jamaah?.nama_lengkap || '-',
        username: jamaah?.username || '-',
        harga_porsi: hargaPorsi,
        total_dibayar: totalDibayar,
        sisa_tagihan_pribadi: Math.max(0, hargaPorsi - totalDibayar),
        progres: hargaPorsi > 0 ? Math.min(100, Math.round((totalDibayar / hargaPorsi) * 100)) : 0,
        lunas: hargaPorsi > 0 && totalDibayar >= hargaPorsi,
        jumlah_transaksi: transaksi.length,
      };
    })
  );
}

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

// GET /api/laporan/kelompok — progres tabungan per kelompok + rincian anggota
exports.perKelompok = asyncHandler(async (req, res) => {
  const list = await KelompokQurban.find().sort({ createdAt: -1 }).lean();
  const lengkap = await lengkapiSemuaKelompok(list);
  const denganAnggota = await Promise.all(
    lengkap.map(async (kelompok) => ({
      ...kelompok,
      anggota: await progresAnggota(kelompok),
    }))
  );
  ok(res, denganAnggota);
});
