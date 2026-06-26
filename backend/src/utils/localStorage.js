const fs = require('fs');
const path = require('path');

// Penyimpanan media profil di disk server lokal — dipakai bila Cloudinary
// belum dikonfigurasi, sehingga fitur upload langsung berfungsi tanpa akun apa
// pun. Berkas disimpan di backend/uploads/profil dan disajikan oleh Express
// pada path /uploads (lihat app.js).
const DIR_UPLOAD = path.join(__dirname, '..', '..', 'uploads');

const EXT_MIME = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

function ekstensiBerkas(file) {
  const dariNama = path.extname(file.originalname || '').toLowerCase();
  if (/^\.[a-z0-9]{1,5}$/.test(dariNama)) return dariNama;
  return EXT_MIME[file.mimetype] || '';
}

// Simpan buffer multer ke disk pada subfolder uploads/<sub>, kembalikan PATH
// RELATIF (mis. /uploads/profil/xxx.png).
function simpanMediaLokal(file, sub = 'profil') {
  const dir = path.join(DIR_UPLOAD, sub);
  fs.mkdirSync(dir, { recursive: true });
  const nama = `${sub}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ekstensiBerkas(file)}`;
  fs.writeFileSync(path.join(dir, nama), file.buffer);
  return `/uploads/${sub}/${nama}`;
}

module.exports = { simpanMediaLokal };
