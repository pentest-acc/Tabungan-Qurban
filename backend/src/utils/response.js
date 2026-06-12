// Helper respons konsisten: { success, message, data }
exports.ok = (res, data, message = 'Berhasil', status = 200) =>
  res.status(status).json({ success: true, message, data });

exports.fail = (res, message = 'Terjadi kesalahan', status = 400) =>
  res.status(status).json({ success: false, message });

// Error dengan status HTTP, ditangkap errorHandler.
class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
exports.ApiError = ApiError;

// Bungkus async controller agar error diteruskan ke errorHandler.
exports.asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
