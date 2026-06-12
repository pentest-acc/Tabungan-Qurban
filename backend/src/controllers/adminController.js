const Admin = require('../models/Admin');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// GET /api/admin — daftar admin (search opsional: ?q=)
exports.getAll = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? {
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { nama_lengkap: { $regex: q, $options: 'i' } },
        ],
      }
    : {};
  const admins = await Admin.find(filter).sort({ createdAt: -1 });
  ok(res, admins);
});

// POST /api/admin — daftarkan admin biasa baru (khusus kepala admin)
exports.create = asyncHandler(async (req, res) => {
  const { username, password, nama_lengkap } = req.body;
  const admin = await Admin.create({
    username,
    password,
    nama_lengkap,
    role: 'admin_biasa', // kepala admin tidak bisa dibuat lewat endpoint ini
  });
  ok(res, admin, 'Admin biasa berhasil didaftarkan', 201);
});

// PUT /api/admin/:id
exports.update = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ id_admin: req.params.id });
  if (!admin) throw new ApiError('Admin tidak ditemukan', 404);
  if (admin.role === 'kepala_admin') throw new ApiError('Akun kepala admin tidak dapat diubah', 403);

  const { username, password, nama_lengkap } = req.body;
  if (username) admin.username = username;
  if (nama_lengkap) admin.nama_lengkap = nama_lengkap;
  if (password) admin.password = password; // di-hash oleh pre-save hook
  await admin.save();
  ok(res, admin, 'Data admin berhasil diperbarui');
});

// DELETE /api/admin/:id
exports.remove = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ id_admin: req.params.id });
  if (!admin) throw new ApiError('Admin tidak ditemukan', 404);
  if (admin.role === 'kepala_admin') throw new ApiError('Akun kepala admin tidak dapat dihapus', 403);

  await admin.deleteOne();
  ok(res, null, 'Akun admin berhasil dihapus');
});
