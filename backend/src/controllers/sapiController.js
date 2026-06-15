const SapiQurban = require('../models/SapiQurban');
const KelompokQurban = require('../models/KelompokQurban');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// Satu sapi qurban dibagi untuk 7 orang (sesuai syariat). Harga per porsi
// SELALU dihitung otomatis dari harga sapi — admin cukup mengisi harga sapi.
const PORSI_PER_SAPI = 7;
const hitungHargaPorsi = (hargaSapi) => Math.ceil(Number(hargaSapi) / PORSI_PER_SAPI);

// GET /api/sapi — daftar sapi (search opsional: ?q=)
exports.getAll = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = q ? { penanda_sapi: { $regex: q, $options: 'i' } } : {};
  const sapi = await SapiQurban.find(filter).sort({ createdAt: -1 });
  ok(res, sapi);
});

// GET /api/sapi/:id
exports.getById = asyncHandler(async (req, res) => {
  const sapi = await SapiQurban.findOne({ id_sapi: req.params.id });
  if (!sapi) throw new ApiError('Sapi tidak ditemukan', 404);
  ok(res, sapi);
});

// POST /api/sapi
exports.create = asyncHandler(async (req, res) => {
  const { penanda_sapi, bobot_estimasi, harga_sapi } = req.body;
  // harga_porsi tidak diambil dari klien — dihitung otomatis dari harga sapi.
  const sapi = await SapiQurban.create({
    penanda_sapi,
    bobot_estimasi,
    harga_sapi,
    harga_porsi: hitungHargaPorsi(harga_sapi),
  });
  ok(res, sapi, 'Sapi qurban berhasil ditambahkan', 201);
});

// PUT /api/sapi/:id
exports.update = asyncHandler(async (req, res) => {
  const sapi = await SapiQurban.findOne({ id_sapi: req.params.id });
  if (!sapi) throw new ApiError('Sapi tidak ditemukan', 404);

  const { penanda_sapi, bobot_estimasi, harga_sapi } = req.body;
  if (penanda_sapi) sapi.penanda_sapi = penanda_sapi;
  if (bobot_estimasi !== undefined) sapi.bobot_estimasi = bobot_estimasi;
  if (harga_sapi !== undefined) {
    sapi.harga_sapi = harga_sapi;
    // Harga porsi selalu mengikuti harga sapi terbaru (otomatis).
    sapi.harga_porsi = hitungHargaPorsi(harga_sapi);
  }
  await sapi.save();
  ok(res, sapi, 'Data sapi berhasil diperbarui');
});

// DELETE /api/sapi/:id — tolak jika sapi sudah dipakai kelompok
exports.remove = asyncHandler(async (req, res) => {
  const sapi = await SapiQurban.findOne({ id_sapi: req.params.id });
  if (!sapi) throw new ApiError('Sapi tidak ditemukan', 404);

  const dipakai = await KelompokQurban.exists({ id_sapi: sapi.id_sapi });
  if (dipakai) throw new ApiError('Sapi sedang digunakan oleh kelompok, tidak dapat dihapus', 409);

  await sapi.deleteOne();
  ok(res, null, 'Data sapi berhasil dihapus');
});
