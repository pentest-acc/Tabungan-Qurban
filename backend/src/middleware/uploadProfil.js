const multer = require('multer');
const { ApiError } = require('../utils/response');

// Upload media profil: gambar statis, GIF beranimasi, atau video pendek.
// Disimpan di memori lalu diteruskan ke Cloudinary (resource_type auto).
const uploadProfil = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }, // maks 12MB (cukup untuk klip pendek)
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    if (/^video\/(mp4|webm|quicktime)$/.test(file.mimetype)) return cb(null, true);
    cb(new ApiError('Foto profil harus berupa gambar (png/jpg/webp/gif) atau video (mp4/webm)', 422));
  },
});

module.exports = uploadProfil;
