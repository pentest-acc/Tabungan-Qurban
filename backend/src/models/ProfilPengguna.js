const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

// Media profil pengguna (foto/GIF/video) + pilihan border beranimasi ala Discord.
// DISIMPAN TERPISAH dari koleksi jamaah/admin secara sengaja: koleksi baru ini
// bebas dari $jsonSchema validator lama, sehingga penambahan fitur avatar tidak
// berisiko melanggar validasi dokumen pada koleksi inti.
const profilSchema = new mongoose.Schema(
  {
    id_profil: { type: String, required: true, unique: true, default: () => generateId('PRF') },
    // id_jamaah ATAU id_admin pemilik profil.
    id_pengguna: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['jamaah', 'admin_biasa', 'kepala_admin'], required: true },
    foto_profil: { type: String, default: '' }, // URL Cloudinary
    tipe_media: { type: String, enum: ['gambar', 'video'], default: 'gambar' },
    border_profil: { type: String, default: 'none' },
    // Crop/framing (zoom & posisi fokus) — diterapkan via CSS saat ditampilkan,
    // sehingga animasi GIF/video tetap utuh (tanpa encode ulang).
    crop_scale: { type: Number, default: 1 },
    crop_x: { type: Number, default: 50 },
    crop_y: { type: Number, default: 50 },
  },
  { collection: 'profil_pengguna', timestamps: true }
);

module.exports = mongoose.model('ProfilPengguna', profilSchema);
