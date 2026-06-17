const KelompokQurban = require('../models/KelompokQurban');
const SapiQurban = require('../models/SapiQurban');
const TabunganQurban = require('../models/TabunganQurban');
const DetailKelompok = require('../models/DetailKelompok');
const Jamaah = require('../models/Jamaah');
const ProfilPengguna = require('../models/ProfilPengguna');

const KUOTA_MAKSIMAL = 7;

// Gabungkan kelompok dengan sapi, tabungan, dan jumlah anggota.
async function lengkapiKelompok(kelompok) {
  const [sapi, tabungan, jumlahAnggota] = await Promise.all([
    SapiQurban.findOne({ id_sapi: kelompok.id_sapi }).lean(),
    TabunganQurban.findOne({ id_kelompok: kelompok.id_kelompok }).lean(),
    DetailKelompok.countDocuments({ id_kelompok: kelompok.id_kelompok }),
  ]);
  return { ...kelompok, sapi, tabungan, jumlah_anggota: jumlahAnggota };
}

async function lengkapiSemuaKelompok(list) {
  return Promise.all(list.map((kelompok) => lengkapiKelompok(kelompok)));
}

// Daftar anggota kelompok beserta profil publik jamaah.
// Informasi sensitif (no_telp, alamat, password) sengaja TIDAK disertakan —
// sesama jamaah hanya boleh melihat nama, username, foto/border profil, dan
// tanggal bergabung. Foto & border profil bersifat publik (memang untuk dipajang).
async function daftarAnggota(idKelompok) {
  const details = await DetailKelompok.find({ id_kelompok: idKelompok }).lean();
  return Promise.all(
    details.map(async (detail) => {
      const [jamaah, profil] = await Promise.all([
        Jamaah.findOne({ id_jamaah: detail.id_jamaah }).select('id_jamaah nama_lengkap username').lean(),
        ProfilPengguna.findOne({ id_pengguna: detail.id_jamaah }).lean(),
      ]);
      return {
        ...detail,
        nama_lengkap: jamaah?.nama_lengkap,
        jamaah,
        foto_profil: profil?.foto_profil || '',
        tipe_media: profil?.tipe_media || 'gambar',
        border_profil: profil?.border_profil || 'none',
        crop_scale: profil?.crop_scale ?? 1,
        crop_x: profil?.crop_x ?? 50,
        crop_y: profil?.crop_y ?? 50,
        bergabung_sejak: detail.createdAt,
      };
    })
  );
}

// Cek apakah kuota kelompok sudah penuh (status enum dokumen tidak memiliki
// nilai "penuh", jadi penutupan akses dilakukan lewat pengecekan kuota ini).
async function kuotaPenuh(idKelompok) {
  const jumlah = await DetailKelompok.countDocuments({ id_kelompok: idKelompok });
  return jumlah >= KUOTA_MAKSIMAL;
}

module.exports = {
  KUOTA_MAKSIMAL,
  lengkapiKelompok,
  lengkapiSemuaKelompok,
  daftarAnggota,
  kuotaPenuh,
};
