const TabunganQurban = require('../models/TabunganQurban');
const { ringkasanTabunganJamaah } = require('../services/tabunganService');
const { lengkapiKelompok } = require('../services/kelompokService');
const KelompokQurban = require('../models/KelompokQurban');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// GET /api/tabungan/saya — tabungan + tagihan pribadi jamaah yang login
exports.getMine = asyncHandler(async (req, res) => {
  const ringkasan = await ringkasanTabunganJamaah(req.user.id_jamaah);
  // null = belum tergabung kelompok; frontend menampilkan empty state.
  ok(res, ringkasan);
});

// GET /api/tabungan/kelompok/:id — tabungan sebuah kelompok
exports.getByKelompok = asyncHandler(async (req, res) => {
  const tabungan = await TabunganQurban.findOne({ id_kelompok: req.params.id }).lean();
  if (!tabungan) throw new ApiError('Tabungan tidak ditemukan', 404);

  const kelompok = await KelompokQurban.findOne({ id_kelompok: req.params.id }).lean();
  ok(res, { ...tabungan, kelompok: kelompok ? await lengkapiKelompok(kelompok) : null });
});
