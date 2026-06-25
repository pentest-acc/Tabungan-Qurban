const LaporanBug = require('../models/LaporanBug');
const { kirimEmail } = require('../utils/kirimEmail');
const { ok, ApiError, asyncHandler } = require('../utils/response');

const KATEGORI = ['bug', 'saran', 'lainnya'];

// POST /api/feedback — kirim laporan bug/saran ke developer (publik).
// Laporan SELALU disimpan ke DB; email dikirim bila SMTP dikonfigurasi.
exports.buat = asyncHandler(async (req, res) => {
  const { kategori, pesan, kontak } = req.body;
  if (!pesan || !String(pesan).trim()) throw new ApiError('Pesan laporan wajib diisi', 422);
  if (String(pesan).length > 4000) throw new ApiError('Pesan terlalu panjang (maks 4000 karakter)', 422);

  const kat = KATEGORI.includes(kategori) ? kategori : 'lainnya';
  const pesanBersih = String(pesan).trim();
  const kontakBersih = (kontak || '').toString().trim().slice(0, 200);

  const subjek = `[Lapor ${kat.toUpperCase()}] Tabungan Qurban`;
  const teks =
    `Kategori : ${kat}\n` +
    `Kontak   : ${kontakBersih || '-'}\n` +
    `Waktu    : ${new Date().toLocaleString('id-ID')}\n\n` +
    `Pesan:\n${pesanBersih}`;

  const hasil = await kirimEmail({ subjek, teks, replyTo: kontakBersih || undefined });

  await LaporanBug.create({
    kategori: kat,
    pesan: pesanBersih,
    kontak: kontakBersih,
    email_terkirim: !!hasil.terkirim,
  });

  ok(res, { email: hasil }, 'Laporan terkirim. Terima kasih atas masukan Anda!', 201);
});
