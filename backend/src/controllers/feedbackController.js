const LaporanBug = require('../models/LaporanBug');
const { kirimEmail } = require('../utils/kirimEmail');
const { simpanMediaLokal } = require('../utils/localStorage');
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

  // Lampiran gambar (opsional): di-attach ke email + disimpan ke disk utk arsip.
  let lampiranPath = '';
  const attachments = [];
  if (req.file) {
    attachments.push({ filename: req.file.originalname || 'lampiran', content: req.file.buffer });
    try {
      lampiranPath = simpanMediaLokal(req.file, 'laporan');
    } catch (err) {
      console.error('Gagal menyimpan lampiran laporan:', err.message);
    }
  }

  const subjek = `[Lapor ${kat.toUpperCase()}] Tabungan Qurban`;
  const teks =
    `Kategori : ${kat}\n` +
    `Kontak   : ${kontakBersih || '-'}\n` +
    `Waktu    : ${new Date().toLocaleString('id-ID')}\n` +
    `Lampiran : ${req.file ? 'ada (terlampir di email)' : '-'}\n\n` +
    `Pesan:\n${pesanBersih}`;

  const hasil = await kirimEmail({
    subjek,
    teks,
    replyTo: kontakBersih || undefined,
    attachments,
  });

  await LaporanBug.create({
    kategori: kat,
    pesan: pesanBersih,
    kontak: kontakBersih,
    lampiran: lampiranPath,
    email_terkirim: !!hasil.terkirim,
  });

  ok(res, { email: hasil }, 'Laporan terkirim. Terima kasih atas masukan Anda!', 201);
});
