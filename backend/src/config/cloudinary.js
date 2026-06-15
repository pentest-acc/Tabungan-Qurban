const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

// Upload buffer (dari multer memoryStorage) ke Cloudinary, kembalikan secure_url.
function uploadBuffer(buffer, folder = 'tabungan-qurban/bukti') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

// Upload media apa pun (gambar/GIF/video) ke Cloudinary. resource_type 'auto'
// membiarkan Cloudinary mendeteksi sendiri jenis berkas. Mengembalikan url +
// resource_type ('image' | 'video') agar frontend tahu cara menampilkannya.
function uploadMedia(buffer, folder = 'tabungan-qurban/profil') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (err, result) =>
        err ? reject(err) : resolve({ url: result.secure_url, resourceType: result.resource_type })
    );
    stream.end(buffer);
  });
}

module.exports = { cloudinary, uploadBuffer, uploadMedia, isConfigured };
