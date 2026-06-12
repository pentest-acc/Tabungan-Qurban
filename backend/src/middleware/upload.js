const multer = require('multer');
const { ApiError } = require('../utils/response');

// Simpan di memori lalu diteruskan ke Cloudinary oleh controller.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // maks 2MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new ApiError('Bukti pembayaran harus berupa gambar (png/jpg/webp)', 422));
  },
});

module.exports = upload;
