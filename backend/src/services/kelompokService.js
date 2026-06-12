const KelompokQurban = require('../models/KelompokQurban');
const SapiQurban = require('../models/SapiQurban');
const TabunganQurban = require('../models/TabunganQurban');
const DetailKelompok = require('../models/DetailKelompok');
const Jamaah = require('../models/Jamaah');

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

// Daftar anggota kelompok beserta nama jamaah.
async function daftarAnggota(idKelompok) {
  const details = await DetailKelompok.find({ id_kelompok: idKelompok }).lean();
  return Promise.all(
    details.map(async (detail) => {
      const jamaah = await Jamaah.findOne({ id_jamaah: detail.id_jamaah })
        .select('id_jamaah nama_lengkap username no_telp')
        .lean();
      return { ...detail, nama_lengkap: jamaah?.nama_lengkap, jamaah };
    })
  );
}

// Tandai kelompok "Penuh" bila kuota tercapai, atau kembali "Aktif" bila lowong.
async function sinkronkanStatusKuota(idKelompok) {
  const kelompok = await KelompokQurban.findOne({ id_kelompok: idKelompok });
  if (!kelompok || kelompok.status === 'Expired') return kelompok;
  const jumlah = await DetailKelompok.countDocuments({ id_kelompok: idKelompok });
  kelompok.status = jumlah >= KUOTA_MAKSIMAL ? 'Penuh' : 'Aktif';
  await kelompok.save();
  return kelompok;
}

module.exports = {
  KUOTA_MAKSIMAL,
  lengkapiKelompok,
  lengkapiSemuaKelompok,
  daftarAnggota,
  sinkronkanStatusKuota,
};
