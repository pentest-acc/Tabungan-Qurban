/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Jamaah = require('../models/Jamaah');
const SapiQurban = require('../models/SapiQurban');
const KelompokQurban = require('../models/KelompokQurban');
const TabunganQurban = require('../models/TabunganQurban');
const DetailKelompok = require('../models/DetailKelompok');
const PermintaanGabung = require('../models/PermintaanGabung');
const Transaksi = require('../models/Transaksi');
const { buatTabunganOtomatis, catatPembayaran } = require('../services/tabunganService');

async function seed() {
  await connectDB();

  console.log('Menghapus data lama...');
  await Promise.all([
    Admin.deleteMany({}),
    Jamaah.deleteMany({}),
    SapiQurban.deleteMany({}),
    KelompokQurban.deleteMany({}),
    TabunganQurban.deleteMany({}),
    DetailKelompok.deleteMany({}),
    PermintaanGabung.deleteMany({}),
    Transaksi.deleteMany({}),
  ]);

  console.log('Membuat akun admin...');
  await Admin.create({
    username: 'kepala',
    password: 'kepala123',
    nama_lengkap: 'Ilham Maulana',
    role: 'kepala_admin',
  });
  await Admin.create({
    username: 'admin',
    password: 'admin123',
    nama_lengkap: 'Stephen Baldwin',
    role: 'admin_biasa',
  });

  console.log('Membuat akun jamaah...');
  const dataJamaah = [
    { username: 'zaid', nama_lengkap: 'Muhammad Zaid D.', no_telp: '081234567801', alamat: 'Jakarta Selatan' },
    { username: 'saptur', nama_lengkap: 'Saptur Rahman', no_telp: '081234567802', alamat: 'Depok' },
    { username: 'abi', nama_lengkap: 'Abi Pradipa P.R.', no_telp: '081234567803', alamat: 'Bogor' },
    { username: 'fauzi', nama_lengkap: 'Ahmad Fauzi', no_telp: '081234567804', alamat: 'Bekasi' },
    { username: 'siti', nama_lengkap: 'Siti Aminah', no_telp: '081234567805', alamat: 'Tangerang' },
  ];
  const jamaahDocs = [];
  for (const data of dataJamaah) {
    jamaahDocs.push(await Jamaah.create({ ...data, password: 'jamaah123' }));
  }

  console.log('Membuat data sapi qurban...');
  const sapi1 = await SapiQurban.create({
    penanda_sapi: 'Sapi Limosin A-01',
    bobot_estimasi: 450.5,
    harga_sapi: 23800000,
    harga_porsi: 3400000,
  });
  const sapi2 = await SapiQurban.create({
    penanda_sapi: 'Sapi Brahman B-02',
    bobot_estimasi: 420.0,
    harga_sapi: 23800000,
    harga_porsi: 3400000,
  });
  await SapiQurban.create({
    penanda_sapi: 'Sapi Madura C-03',
    bobot_estimasi: 380.25,
    harga_sapi: 21000000,
    harga_porsi: 3000000,
  });

  console.log('Membuat kelompok + tabungan otomatis...');
  const tahunDepan = new Date();
  tahunDepan.setFullYear(tahunDepan.getFullYear() + 1);

  const kelompok1 = await KelompokQurban.create({
    id_sapi: sapi1.id_sapi,
    nomor_kelompok: '01',
    tanggal_mulai: new Date(),
    tanggal_berakhir: tahunDepan,
    status: 'aktif',
  });
  const tabungan1 = await buatTabunganOtomatis(kelompok1);

  const kelompok2 = await KelompokQurban.create({
    id_sapi: sapi2.id_sapi,
    nomor_kelompok: '02',
    tanggal_mulai: new Date(),
    tanggal_berakhir: tahunDepan,
    status: 'aktif',
  });
  await buatTabunganOtomatis(kelompok2);

  console.log('Mendaftarkan anggota kelompok 01...');
  for (const jamaah of jamaahDocs.slice(0, 3)) {
    await DetailKelompok.create({ id_kelompok: kelompok1.id_kelompok, id_jamaah: jamaah.id_jamaah });
    await PermintaanGabung.create({
      id_kelompok: kelompok1.id_kelompok,
      id_jamaah: jamaah.id_jamaah,
      status: 'diterima',
      catatan: 'Ingin ikut qurban tahun ini',
    });
  }

  console.log('Membuat permintaan pending...');
  await PermintaanGabung.create({
    id_kelompok: kelompok1.id_kelompok,
    id_jamaah: jamaahDocs[3].id_jamaah,
    status: 'pending',
    catatan: 'Mohon diterima, saya ingin bergabung',
  });
  await PermintaanGabung.create({
    id_kelompok: kelompok2.id_kelompok,
    id_jamaah: jamaahDocs[4].id_jamaah,
    status: 'pending',
    catatan: '',
  });

  console.log('Membuat transaksi contoh...');
  const contohTransaksi = [
    { jamaah: jamaahDocs[0], total: 3400000, metode: 'Transfer Bank', jenis: 'tunai' },
    { jamaah: jamaahDocs[1], total: 1000000, metode: 'E-Wallet', jenis: 'cicil' },
    { jamaah: jamaahDocs[1], total: 500000, metode: 'QRIS', jenis: 'cicil' },
    { jamaah: jamaahDocs[2], total: 1700000, metode: 'Transfer Bank', jenis: 'cicil' },
  ];
  for (const data of contohTransaksi) {
    await Transaksi.create({
      id_tabungan: tabungan1.id_tabungan,
      id_jamaah: data.jamaah.id_jamaah,
      total_bayar: data.total,
      metode_bayar: data.metode,
      jenis_transaksi: data.jenis,
      status_pembayaran: 'success',
    });
    await catatPembayaran(tabungan1.id_tabungan, data.total);
  }

  console.log('\nSeed selesai! Akun yang tersedia:');
  console.log('  Kepala Admin : kepala / kepala123');
  console.log('  Admin Biasa  : admin / admin123');
  console.log('  Jamaah       : zaid|saptur|abi|fauzi|siti / jamaah123');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed gagal:', err);
  process.exit(1);
});
