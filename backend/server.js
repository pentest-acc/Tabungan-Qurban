require('dotenv').config();

// Gagal cepat dengan pesan jelas bila konfigurasi wajib belum ada,
// daripada error membingungkan saat login (secretOrPrivateKey must have a value).
if (!process.env.JWT_SECRET) {
  console.error(
    'JWT_SECRET belum diisi!\n' +
      'Salin .env.example menjadi .env lalu isi JWT_SECRET, contoh:\n' +
      '  cp .env.example .env\n' +
      '  JWT_SECRET=teks-rahasia-bebas\n' +
      'Setelah itu jalankan ulang server.'
  );
  process.exit(1);
}

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
});
