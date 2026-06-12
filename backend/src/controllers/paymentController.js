const Transaksi = require('../models/Transaksi');
const TabunganQurban = require('../models/TabunganQurban');
const KelompokQurban = require('../models/KelompokQurban');
const Jamaah = require('../models/Jamaah');
const paymentService = require('../services/paymentService');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// Bentuk respons checkout/status yang dipakai frontend.
function ringkasPembayaran(transaksi) {
  return {
    nomor_referensi: transaksi.nomor_referensi,
    id_transaksi: transaksi.id_transaksi,
    total_bayar: transaksi.total_bayar,
    metode_bayar: transaksi.metode_bayar,
    jenis_transaksi: transaksi.jenis_transaksi,
    status_pembayaran: transaksi.status_pembayaran,
    kode_bayar: transaksi.kode_bayar,
    kadaluarsa: transaksi.kadaluarsa,
    bukti_pembayaran: transaksi.bukti_pembayaran,
    tanggal_bayar: transaksi.tanggal_bayar,
    instruksi: paymentService.instruksiPembayaran(transaksi.metode_bayar, transaksi.kode_bayar),
  };
}

// POST /api/payment/checkout — jamaah membuat transaksi pembayaran (status pending)
exports.checkout = asyncHandler(async (req, res) => {
  const { id_tabungan, metode_bayar, jenis_transaksi } = req.body;
  const { transaksi, lanjutan } = await paymentService.buatCheckout({
    idTabungan: id_tabungan,
    idJamaah: req.user.id_jamaah,
    totalBayar: Number(req.body.total_bayar),
    metodeBayar: metode_bayar,
    jenisTransaksi: jenis_transaksi,
  });
  ok(
    res,
    ringkasPembayaran(transaksi),
    lanjutan
      ? 'Anda masih memiliki pembayaran yang belum selesai, lanjutkan pembayaran ini'
      : 'Checkout dibuat, selesaikan pembayaran sebelum batas waktu',
    201
  );
});

// GET /api/payment/status/:ref — cek status pembayaran (auto-gugur jika timeout)
exports.status = asyncHandler(async (req, res) => {
  let transaksi = await Transaksi.findOne({ nomor_referensi: req.params.ref });
  if (!transaksi) throw new ApiError('Transaksi tidak ditemukan', 404);

  // Jamaah hanya boleh melihat transaksinya sendiri; admin boleh semua.
  if (req.role === 'jamaah' && transaksi.id_jamaah !== req.user.id_jamaah) {
    throw new ApiError('Anda tidak berhak melihat transaksi ini', 403);
  }

  transaksi = await paymentService.gugurkanJikaKadaluarsa(transaksi);
  ok(res, ringkasPembayaran(transaksi));
});

// POST /api/payment/webhook — callback dari payment gateway (tanpa auth,
// diamankan dengan signature HMAC; idempoten terhadap pengiriman ganda)
exports.webhook = asyncHandler(async (req, res) => {
  const { transaksi, diproses } = await paymentService.prosesWebhook(req.body);
  ok(res, {
    nomor_referensi: transaksi.nomor_referensi,
    status_pembayaran: transaksi.status_pembayaran,
    diproses,
  });
});

// GET /api/payment/receipt/:ref — data kwitansi internal (bukti pembayaran)
exports.receipt = asyncHandler(async (req, res) => {
  const transaksi = await Transaksi.findOne({ nomor_referensi: req.params.ref }).lean();
  if (!transaksi) throw new ApiError('Transaksi tidak ditemukan', 404);
  if (req.role === 'jamaah' && transaksi.id_jamaah !== req.user.id_jamaah) {
    throw new ApiError('Anda tidak berhak melihat kwitansi ini', 403);
  }

  const [jamaah, tabungan] = await Promise.all([
    Jamaah.findOne({ id_jamaah: transaksi.id_jamaah }).select('nama_lengkap username').lean(),
    TabunganQurban.findOne({ id_tabungan: transaksi.id_tabungan }).lean(),
  ]);
  const kelompok = tabungan
    ? await KelompokQurban.findOne({ id_kelompok: tabungan.id_kelompok })
        .select('nomor_kelompok')
        .lean()
    : null;

  ok(res, {
    ...transaksi,
    nama_jamaah: jamaah?.nama_lengkap || transaksi.id_jamaah,
    nomor_kelompok: kelompok?.nomor_kelompok || '-',
  });
});

// POST /api/payment/simulate/:ref — simulator sandbox: berperan sebagai payment
// gateway yang mengirim webhook bertanda tangan. Body: { hasil: "success"|"failed" }
exports.simulate = asyncHandler(async (req, res) => {
  const transaksi = await Transaksi.findOne({ nomor_referensi: req.params.ref });
  if (!transaksi) throw new ApiError('Transaksi tidak ditemukan', 404);
  if (req.role === 'jamaah' && transaksi.id_jamaah !== req.user.id_jamaah) {
    throw new ApiError('Anda tidak berhak atas transaksi ini', 403);
  }

  const hasil = req.body.hasil === 'failed' ? 'failed' : 'success';
  const payload = {
    nomor_referensi: transaksi.nomor_referensi,
    status: hasil,
    total_bayar: transaksi.total_bayar,
    signature: paymentService.buatSignature(transaksi.nomor_referensi, hasil, transaksi.total_bayar),
  };
  const { transaksi: hasilTransaksi } = await paymentService.prosesWebhook(payload);
  ok(res, ringkasPembayaran(hasilTransaksi), `Simulasi pembayaran ${hasil} dikirim`);
});
