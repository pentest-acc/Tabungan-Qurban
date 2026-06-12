const crypto = require('crypto');
const Transaksi = require('../models/Transaksi');
const TabunganQurban = require('../models/TabunganQurban');
const DetailKelompok = require('../models/DetailKelompok');
const { catatPembayaran } = require('./tabunganService');
const { ApiError } = require('../utils/response');

const SERVER_KEY = () => process.env.PAYMENT_SERVER_KEY || 'sandbox-server-key';
const EXPIRY_MINUTES = () => Number(process.env.PAYMENT_EXPIRY_MINUTES) || 30;

// Signature webhook: HMAC-SHA256(nomor_referensi:status:total_bayar, SERVER_KEY).
// Provider asli (Midtrans/Xendit) punya skema serupa — tinggal sesuaikan di sini.
function buatSignature(nomorReferensi, status, totalBayar) {
  return crypto
    .createHmac('sha256', SERVER_KEY())
    .update(`${nomorReferensi}:${status}:${totalBayar}`)
    .digest('hex');
}

function verifikasiSignature(payload) {
  const { nomor_referensi, status, total_bayar, signature } = payload;
  if (!signature) return false;
  const expected = buatSignature(nomor_referensi, status, total_bayar);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false; // panjang berbeda = signature pasti salah
  }
}

// Kode bayar deterministik dari nomor referensi (VA / kode QRIS / kode e-wallet).
function buatKodeBayar(nomorReferensi, metodeBayar) {
  const digits = parseInt(crypto.createHash('md5').update(nomorReferensi).digest('hex').slice(0, 12), 16)
    .toString()
    .padStart(12, '0')
    .slice(0, 12);
  if (metodeBayar === 'Transfer Bank') return `8808${digits}`; // virtual account
  if (metodeBayar === 'E-Wallet') return `EW-${digits.slice(0, 8)}`;
  return `QRIS.ID.${nomorReferensi}`; // payload string QRIS
}

function instruksiPembayaran(metodeBayar, kodeBayar) {
  if (metodeBayar === 'Transfer Bank') {
    return [
      'Buka aplikasi m-banking atau ATM Anda',
      'Pilih menu Transfer > Virtual Account',
      `Masukkan nomor Virtual Account: ${kodeBayar}`,
      'Periksa nama penerima "Tabungan Qurban" lalu konfirmasi pembayaran',
    ];
  }
  if (metodeBayar === 'E-Wallet') {
    return [
      'Buka aplikasi e-wallet Anda (GoPay/OVO/Dana/ShopeePay)',
      'Pilih menu Bayar > Masukkan Kode Pembayaran',
      `Masukkan kode: ${kodeBayar}`,
      'Konfirmasi pembayaran di aplikasi',
    ];
  }
  return [
    'Buka aplikasi pembayaran apa pun yang mendukung QRIS',
    'Pindai kode QR yang ditampilkan',
    'Periksa nominal lalu konfirmasi pembayaran',
  ];
}

// 1) Buat checkout: transaksi status "pending" + instruksi pembayaran.
async function buatCheckout({ idTabungan, idJamaah, totalBayar, metodeBayar, jenisTransaksi }) {
  const tabungan = await TabunganQurban.findOne({ id_tabungan: idTabungan });
  if (!tabungan) throw new ApiError('Tabungan tidak ditemukan', 404);

  const anggota = await DetailKelompok.exists({
    id_kelompok: tabungan.id_kelompok,
    id_jamaah: idJamaah,
  });
  if (!anggota) throw new ApiError('Anda bukan anggota kelompok tabungan ini', 403);

  // Cegah penumpukan tagihan: satu pembayaran pending per jamaah per tabungan.
  const masihPending = await Transaksi.findOne({
    id_tabungan: idTabungan,
    id_jamaah: idJamaah,
    status_pembayaran: 'pending',
    kadaluarsa: { $gt: new Date() },
  });
  if (masihPending) {
    return { transaksi: masihPending, lanjutan: true };
  }

  const nomorReferensi = `PAY-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const kodeBayar = buatKodeBayar(nomorReferensi, metodeBayar);
  const transaksi = await Transaksi.create({
    id_tabungan: idTabungan,
    id_jamaah: idJamaah,
    total_bayar: totalBayar,
    metode_bayar: metodeBayar,
    jenis_transaksi: jenisTransaksi,
    status_pembayaran: 'pending',
    bukti_pembayaran: '',
    nomor_referensi: nomorReferensi,
    kode_bayar: kodeBayar,
    kadaluarsa: new Date(Date.now() + EXPIRY_MINUTES() * 60 * 1000),
  });
  return { transaksi, lanjutan: false };
}

// Tandai gagal jika sudah lewat batas waktu (timeout).
async function gugurkanJikaKadaluarsa(transaksi) {
  if (
    transaksi.status_pembayaran === 'pending' &&
    transaksi.kadaluarsa &&
    transaksi.kadaluarsa < new Date()
  ) {
    const updated = await Transaksi.findOneAndUpdate(
      { nomor_referensi: transaksi.nomor_referensi, status_pembayaran: 'pending' },
      { status_pembayaran: 'failed' },
      { new: true }
    );
    return updated || transaksi;
  }
  return transaksi;
}

// 2) Proses webhook dari payment gateway — idempoten & race-safe.
//    Transisi hanya boleh terjadi dari "pending"; findOneAndUpdate atomik
//    menjamin webhook ganda tidak memproses transaksi dua kali.
async function prosesWebhook(payload) {
  const { nomor_referensi, status, bukti_pembayaran } = payload;

  if (!nomor_referensi || !['success', 'failed'].includes(status)) {
    throw new ApiError('Payload webhook tidak valid', 422);
  }
  if (!verifikasiSignature(payload)) {
    throw new ApiError('Signature webhook tidak valid', 401);
  }

  const transaksi = await Transaksi.findOne({ nomor_referensi });
  if (!transaksi) throw new ApiError('Transaksi tidak ditemukan', 404);

  // Idempoten: sudah pernah diproses → balas OK tanpa memproses ulang.
  if (transaksi.status_pembayaran !== 'pending') {
    return { transaksi, diproses: false };
  }

  // Timeout: pembayaran datang setelah kadaluarsa → tolak sebagai failed.
  if (transaksi.kadaluarsa && transaksi.kadaluarsa < new Date() && status === 'success') {
    await gugurkanJikaKadaluarsa(transaksi);
    throw new ApiError('Pembayaran melewati batas waktu, transaksi digugurkan', 409);
  }

  const update = { status_pembayaran: status };
  if (status === 'success') {
    update.tanggal_bayar = new Date();
    update.bukti_pembayaran =
      bukti_pembayaran || `https://sandbox-pg.tabungan-qurban.local/receipt/${nomor_referensi}`;
  }

  // Gerbang atomik anti dobel-proses.
  const updated = await Transaksi.findOneAndUpdate(
    { nomor_referensi, status_pembayaran: 'pending' },
    update,
    { new: true }
  );
  if (!updated) {
    return { transaksi: await Transaksi.findOne({ nomor_referensi }), diproses: false };
  }

  // Setelah success: update saldo tabungan_qurban (total_terkumpul & sisa_tagihan_kelompok).
  if (status === 'success') {
    await catatPembayaran(updated.id_tabungan, updated.total_bayar);
  }
  return { transaksi: updated, diproses: true };
}

module.exports = {
  buatSignature,
  verifikasiSignature,
  buatCheckout,
  prosesWebhook,
  gugurkanJikaKadaluarsa,
  instruksiPembayaran,
};
