const Jamaah = require('../models/Jamaah');
const DetailKelompok = require('../models/DetailKelompok');
const PermintaanGabung = require('../models/PermintaanGabung');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// GET /api/jamaah — daftar jamaah (search opsional: ?q=)
exports.getAll = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? {
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { nama_lengkap: { $regex: q, $options: 'i' } },
          { no_telp: { $regex: q, $options: 'i' } },
        ],
      }
    : {};
  const jamaah = await Jamaah.find(filter).sort({ createdAt: -1 });
  ok(res, jamaah);
});

// GET /api/jamaah/:id
exports.getById = asyncHandler(async (req, res) => {
  const jamaah = await Jamaah.findOne({ id_jamaah: req.params.id });
  if (!jamaah) throw new ApiError('Jamaah tidak ditemukan', 404);
  ok(res, jamaah);
});

// POST /api/jamaah — admin mendaftarkan jamaah yang kesulitan membuat akun
exports.create = asyncHandler(async (req, res) => {
  const { username, password, nama_lengkap, no_telp, alamat } = req.body;
  const jamaah = await Jamaah.create({ username, password, nama_lengkap, no_telp, alamat });
  ok(res, jamaah, 'Jamaah berhasil didaftarkan', 201);
});

// PUT /api/jamaah/profil — jamaah memperbarui profilnya sendiri
exports.updateProfil = asyncHandler(async (req, res) => {
  const jamaah = req.user;
  const { username, password, nama_lengkap, no_telp, alamat } = req.body;
  if (username) jamaah.username = username;
  if (nama_lengkap) jamaah.nama_lengkap = nama_lengkap;
  if (no_telp) jamaah.no_telp = no_telp;
  if (alamat !== undefined) jamaah.alamat = alamat;
  if (password) jamaah.password = password;
  await jamaah.save();
  ok(res, jamaah, 'Profil berhasil diperbarui');
});

// PUT /api/jamaah/:id — admin mengubah data jamaah
exports.update = asyncHandler(async (req, res) => {
  const jamaah = await Jamaah.findOne({ id_jamaah: req.params.id });
  if (!jamaah) throw new ApiError('Jamaah tidak ditemukan', 404);

  const { username, password, nama_lengkap, no_telp, alamat } = req.body;
  if (username) jamaah.username = username;
  if (nama_lengkap) jamaah.nama_lengkap = nama_lengkap;
  if (no_telp) jamaah.no_telp = no_telp;
  if (alamat !== undefined) jamaah.alamat = alamat;
  if (password) jamaah.password = password;
  await jamaah.save();
  ok(res, jamaah, 'Data jamaah berhasil diperbarui');
});

// DELETE /api/jamaah/:id — hapus akun beserta keanggotaan & permintaannya
exports.remove = asyncHandler(async (req, res) => {
  const jamaah = await Jamaah.findOne({ id_jamaah: req.params.id });
  if (!jamaah) throw new ApiError('Jamaah tidak ditemukan', 404);

  await Promise.all([
    DetailKelompok.deleteMany({ id_jamaah: jamaah.id_jamaah }),
    PermintaanGabung.deleteMany({ id_jamaah: jamaah.id_jamaah }),
    jamaah.deleteOne(),
  ]);
  ok(res, null, 'Akun jamaah berhasil dihapus');
});
