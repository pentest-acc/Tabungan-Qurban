// Penjadwal siklus hidup kelompok qurban.
//
// Aturan:
//  1. Saat periode kelompok BERAKHIR (tanggal_berakhir terlewati):
//     - Jika tabungan kelompok sudah LUNAS  -> status menjadi 'selesai'.
//     - Jika belum lunas                     -> status menjadi 'expired'.
//     Seluruh anggota menerima notifikasi (in-app + WhatsApp) bahwa kelompok
//     akan dibubarkan dalam 3 hari.
//  2. Tepat 3 hari setelah periode berakhir, keanggotaan kelompok DIBUBARKAN
//     (data detail_kelompok dihapus) dan anggota menerima notifikasi penutup.
//
// Catatan: waktu pembubaran sengaja DIHITUNG dari (tanggal_berakhir + 3 hari),
// bukan disimpan sebagai field baru, agar tidak melanggar $jsonSchema validator
// pada koleksi kelompok_qurban.

const KelompokQurban = require('../models/KelompokQurban');
const TabunganQurban = require('../models/TabunganQurban');
const DetailKelompok = require('../models/DetailKelompok');
const Jamaah = require('../models/Jamaah');
const Notifikasi = require('../models/Notifikasi');
const { kirimWhatsApp } = require('../services/whatsappService');

const TIGA_HARI_MS = 3 * 24 * 60 * 60 * 1000;
const INTERVAL_MS = 60 * 60 * 1000; // periksa tiap 1 jam

// Kirim notifikasi in-app + WhatsApp ke seluruh anggota kelompok.
async function notifikasiSemuaAnggota(idKelompok, judul, pesan, tipe = 'kelompok') {
  const anggota = await DetailKelompok.find({ id_kelompok: idKelompok }).lean();
  await Promise.all(
    anggota.map(async (detail) => {
      try {
        await Notifikasi.create({ id_jamaah: detail.id_jamaah, judul, pesan, tipe });
        const jamaah = await Jamaah.findOne({ id_jamaah: detail.id_jamaah }).lean();
        if (jamaah?.no_telp) await kirimWhatsApp(jamaah.no_telp, `${judul}\n${pesan}`);
      } catch (err) {
        console.error(`[lifecycle] gagal notifikasi anggota ${detail.id_jamaah}:`, err.message);
      }
    })
  );
  return anggota.length;
}

// Langkah 1 — tutup periode kelompok yang sudah berakhir.
async function prosesAkhirPeriode(now = new Date()) {
  const kelompokBerakhir = await KelompokQurban.find({
    status: 'aktif',
    tanggal_berakhir: { $lte: now },
  });

  for (const kelompok of kelompokBerakhir) {
    const tabungan = await TabunganQurban.findOne({ id_kelompok: kelompok.id_kelompok }).lean();
    const lunas = !!tabungan && tabungan.sisa_tagihan_kelompok <= 0;

    kelompok.status = lunas ? 'selesai' : 'expired';
    await kelompok.save();

    const judul = lunas
      ? `Kelompok ${kelompok.nomor_kelompok} Selesai 🎉`
      : `Kelompok ${kelompok.nomor_kelompok} Berakhir`;
    const pesan = lunas
      ? `Alhamdulillah! Tabungan qurban Kelompok ${kelompok.nomor_kelompok} telah LUNAS dan ` +
        `periodenya berakhir. Kelompok akan dibubarkan dalam 3 hari. ` +
        `Terima kasih telah berqurban bersama. 🐄`
      : `Periode Kelompok ${kelompok.nomor_kelompok} telah berakhir, namun target tabungan ` +
        `belum tercapai. Kelompok akan dibubarkan dalam 3 hari. ` +
        `Silakan hubungi admin untuk tindak lanjut.`;

    const jumlah = await notifikasiSemuaAnggota(kelompok.id_kelompok, judul, pesan);
    console.log(
      `[lifecycle] Kelompok ${kelompok.nomor_kelompok} -> ${kelompok.status} ` +
        `(${jumlah} anggota diberi tahu).`
    );
  }
  return kelompokBerakhir.length;
}

// Langkah 2 — bubarkan kelompok 3 hari setelah periode berakhir.
async function prosesPembubaran(now = new Date()) {
  const batas = new Date(now.getTime() - TIGA_HARI_MS);
  const kelompokJatuhTempo = await KelompokQurban.find({
    status: { $in: ['selesai', 'expired'] },
    tanggal_berakhir: { $lte: batas },
  });

  let dibubarkan = 0;
  for (const kelompok of kelompokJatuhTempo) {
    const masihAdaAnggota = await DetailKelompok.countDocuments({ id_kelompok: kelompok.id_kelompok });
    if (masihAdaAnggota === 0) continue; // sudah dibubarkan sebelumnya — idempoten

    const lunas = kelompok.status === 'selesai';
    const judul = `Kelompok ${kelompok.nomor_kelompok} Dibubarkan`;
    const pesan = lunas
      ? `Kelompok ${kelompok.nomor_kelompok} telah resmi dibubarkan. ` +
        `Qurban Anda insya Allah terlaksana. Barakallahu fiikum. 🤲`
      : `Kelompok ${kelompok.nomor_kelompok} telah resmi dibubarkan karena tabungan tidak ` +
        `tercapai. Anda dapat mengajukan bergabung ke kelompok baru kapan saja.`;

    // Beri tahu dulu selagi data anggota masih ada, baru bubarkan.
    await notifikasiSemuaAnggota(kelompok.id_kelompok, judul, pesan);
    await DetailKelompok.deleteMany({ id_kelompok: kelompok.id_kelompok });
    dibubarkan += 1;
    console.log(`[lifecycle] Kelompok ${kelompok.nomor_kelompok} dibubarkan (${masihAdaAnggota} anggota dilepas).`);
  }
  return dibubarkan;
}

async function jalankanSekali() {
  try {
    await prosesAkhirPeriode();
    await prosesPembubaran();
  } catch (err) {
    console.error('[lifecycle] gagal menjalankan siklus kelompok:', err.message);
  }
}

// Dipanggil dari server.js setelah koneksi DB siap.
function mulaiPenjadwalanKelompok() {
  jalankanSekali(); // jalankan langsung saat start
  const timer = setInterval(jalankanSekali, INTERVAL_MS);
  if (typeof timer.unref === 'function') timer.unref();
  console.log('[lifecycle] penjadwal siklus kelompok aktif (periksa tiap 1 jam).');
  return timer;
}

module.exports = {
  mulaiPenjadwalanKelompok,
  prosesAkhirPeriode,
  prosesPembubaran,
  jalankanSekali,
};
