const ProfilPengguna = require('../models/ProfilPengguna');
const { uploadMedia, isConfigured } = require('../config/cloudinary');
const { simpanMediaLokal } = require('../utils/localStorage');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// Bingkai/frame profil yang diizinkan — HARUS sinkron dengan katalog di
// frontend (frontend/src/constants/borderProfil.js).
const BORDER_VALID = [
  'none',
  'api',
  'petir',
  'air',
  'emas',
  'pelangi',
  'aurora',
  'kosmik',
];

const idPenggunaDari = (req) => (req.role === 'jamaah' ? req.user.id_jamaah : req.user.id_admin);

const bentukProfil = (profil) => ({
  foto_profil: profil?.foto_profil || '',
  tipe_media: profil?.tipe_media || 'gambar',
  border_profil: profil?.border_profil || 'none',
});

// Ambil profil media milik salah satu pengguna (dipakai juga oleh authController).
async function ambilProfil(idPengguna) {
  const profil = await ProfilPengguna.findOne({ id_pengguna: idPengguna }).lean();
  return bentukProfil(profil);
}

// GET /api/profil/me — media profil milik pengguna yang login
exports.getMine = asyncHandler(async (req, res) => {
  ok(res, await ambilProfil(idPenggunaDari(req)));
});

// PUT /api/profil/me — perbarui border dan/atau unggah foto/video profil
// Mendukung multipart (field "foto"). Border dikirim lewat field "border_profil".
exports.updateMine = asyncHandler(async (req, res) => {
  const idPengguna = idPenggunaDari(req);
  const update = {};

  // 1) Border beranimasi
  if (req.body.border_profil !== undefined) {
    if (!BORDER_VALID.includes(req.body.border_profil)) {
      throw new ApiError('Border profil tidak valid', 422);
    }
    update.border_profil = req.body.border_profil;
  }

  // 2) Media (opsional). Pakai Cloudinary bila terkonfigurasi; jika tidak,
  //    simpan ke disk server lokal agar fitur tetap berjalan tanpa akun.
  if (req.file) {
    if (isConfigured()) {
      const { url, resourceType } = await uploadMedia(req.file.buffer);
      update.foto_profil = url;
      update.tipe_media = resourceType === 'video' ? 'video' : 'gambar';
    } else {
      update.foto_profil = simpanMediaLokal(req.file);
      update.tipe_media = req.file.mimetype.startsWith('video/') ? 'video' : 'gambar';
    }
  }

  const profil = await ProfilPengguna.findOneAndUpdate(
    { id_pengguna: idPengguna },
    { $set: { ...update, id_pengguna: idPengguna, role: req.role } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  ok(res, bentukProfil(profil), 'Profil berhasil diperbarui');
});

exports.ambilProfil = ambilProfil;
exports.BORDER_VALID = BORDER_VALID;
