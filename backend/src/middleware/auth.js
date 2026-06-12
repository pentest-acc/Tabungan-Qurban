const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Jamaah = require('../models/Jamaah');
const { ApiError, asyncHandler } = require('../utils/response');

// Verifikasi JWT dan muat user (admin/jamaah) ke req.user.
exports.authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError('Token tidak ditemukan, silakan login', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError('Token tidak valid atau kedaluwarsa', 401);
  }

  let user;
  if (payload.role === 'jamaah') {
    user = await Jamaah.findOne({ id_jamaah: payload.id });
  } else {
    user = await Admin.findOne({ id_admin: payload.id });
  }
  if (!user) throw new ApiError('Akun tidak ditemukan', 401);

  req.user = user;
  req.role = payload.role === 'jamaah' ? 'jamaah' : user.role;
  next();
});

// Role-based access control: authorize('admin_biasa', 'kepala_admin')
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.role)) {
    return next(new ApiError('Anda tidak memiliki akses untuk aksi ini', 403));
  }
  next();
};

exports.ADMIN_ROLES = ['admin_biasa', 'kepala_admin'];
