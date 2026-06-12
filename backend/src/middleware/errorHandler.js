exports.notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });
};

// Error handler terpusat: ApiError, error Mongoose, dan error tak terduga.
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Terjadi kesalahan pada server';

  if (err.name === 'ValidationError') {
    status = 422;
    message = Object.values(err.errors)[0]?.message || 'Data tidak valid';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'data';
    message = `${field} sudah terdaftar, gunakan nilai lain`;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Format ID tidak valid';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
};
