const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Jamaah = require('../models/Jamaah');
const { ok, ApiError, asyncHandler } = require('../utils/response');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register — registrasi jamaah baru
exports.register = asyncHandler(async (req, res) => {
  const { username, password, nama_lengkap, no_telp, alamat } = req.body;

  const existing =
    (await Jamaah.findOne({ username })) || (await Admin.findOne({ username }));
  if (existing) throw new ApiError('Username sudah terdaftar', 409);

  const jamaah = await Jamaah.create({ username, password, nama_lengkap, no_telp, alamat });
  ok(res, jamaah, 'Registrasi berhasil, silakan login', 201);
});

// POST /api/auth/login — login jamaah maupun admin (satu pintu)
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (admin && (await admin.comparePassword(password))) {
    const token = signToken(admin.id_admin, admin.role);
    return ok(res, { token, user: { ...admin.toJSON(), role: admin.role } }, 'Login berhasil');
  }

  const jamaah = await Jamaah.findOne({ username });
  if (jamaah && (await jamaah.comparePassword(password))) {
    const token = signToken(jamaah.id_jamaah, 'jamaah');
    return ok(res, { token, user: { ...jamaah.toJSON(), role: 'jamaah' } }, 'Login berhasil');
  }

  throw new ApiError('Username atau password salah', 401);
});

// GET /api/auth/me — profil user yang sedang login
exports.me = asyncHandler(async (req, res) => {
  ok(res, { ...req.user.toJSON(), role: req.role });
});
