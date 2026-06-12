const PermintaanGabung = require('../models/PermintaanGabung');
const DetailKelompok = require('../models/DetailKelompok');
const KelompokQurban = require('../models/KelompokQurban');
const Jamaah = require('../models/Jamaah');
const Notifikasi = require('../models/Notifikasi');
const { KUOTA_MAKSIMAL } = require('../services/kelompokService');
const { kirimWhatsApp } = require('../services/whatsappService');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// GET /api/permintaan — daftar permintaan + data jamaah & kelompok
exports.getAll = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const list = await PermintaanGabung.find(filter).sort({ tanggal_pengajuan: -1 }).lean();

  const enriched = await Promise.all(
    list.map(async (permintaan) => {
      const [jamaah, kelompok] = await Promise.all([
        Jamaah.findOne({ id_jamaah: permintaan.id_jamaah })
          .select('id_jamaah nama_lengkap username no_telp')
          .lean(),
        permintaan.id_kelompok
          ? KelompokQurban.findOne({ id_kelompok: permintaan.id_kelompok })
              .select('id_kelompok nomor_kelompok status')
              .lean()
          : null,
      ]);
      return {
        ...permintaan,
        jamaah,
        kelompok,
        nama_jamaah: jamaah?.nama_lengkap,
        nomor_kelompok: kelompok?.nomor_kelompok,
      };
    })
  );
  ok(res, enriched);
});

// PUT /api/permintaan/:id/terima — admin menentukan kelompok lalu memasukkan
// jamaah ke detail kelompok. Body: { id_kelompok }
exports.terima = asyncHandler(async (req, res) => {
  const permintaan = await PermintaanGabung.findOne({ id_permintaan: req.params.id });
  if (!permintaan) throw new ApiError('Permintaan tidak ditemukan', 404);
  if (permintaan.status !== 'pending') throw new ApiError('Permintaan sudah diproses', 409);

  const idKelompok = req.body.id_kelompok || permintaan.id_kelompok;
  if (!idKelompok) throw new ApiError('Pilih kelompok tujuan untuk jamaah ini', 422);

  const kelompok = await KelompokQurban.findOne({ id_kelompok: idKelompok });
  if (!kelompok) throw new ApiError('Kelompok tidak ditemukan', 404);
  if (kelompok.status !== 'aktif') {
    throw new ApiError(`Kelompok berstatus ${kelompok.status}, tidak menerima anggota baru`, 409);
  }

  const jumlahAnggota = await DetailKelompok.countDocuments({ id_kelompok: idKelompok });
  if (jumlahAnggota >= KUOTA_MAKSIMAL) {
    throw new ApiError('Kuota 7 anggota kelompok tersebut sudah penuh, pilih kelompok lain', 409);
  }

  await DetailKelompok.create({ id_kelompok: idKelompok, id_jamaah: permintaan.id_jamaah });
  permintaan.id_kelompok = idKelompok;
  permintaan.status = 'diterima';
  await permintaan.save();

  // Notifikasi in-app + WhatsApp ke jamaah yang ditempatkan.
  const jamaah = await Jamaah.findOne({ id_jamaah: permintaan.id_jamaah }).lean();
  const pesan =
    `Assalamu'alaikum ${jamaah?.nama_lengkap || ''}. Permintaan Anda diterima — ` +
    `Anda ditempatkan di Kelompok ${kelompok.nomor_kelompok}. ` +
    `Silakan buka aplikasi Tabungan Qurban untuk melihat tagihan dan mulai menabung.`;
  await Notifikasi.create({
    id_jamaah: permintaan.id_jamaah,
    judul: `Anda diterima di Kelompok ${kelompok.nomor_kelompok}`,
    pesan,
    tipe: 'kelompok',
  });
  const hasilWA = jamaah ? await kirimWhatsApp(jamaah.no_telp, pesan) : { terkirim: false };

  ok(res, { permintaan, whatsapp: hasilWA }, 'Jamaah ditempatkan ke kelompok dan notifikasi dikirim');
});

// PUT /api/permintaan/:id/tolak
exports.tolak = asyncHandler(async (req, res) => {
  const permintaan = await PermintaanGabung.findOne({ id_permintaan: req.params.id });
  if (!permintaan) throw new ApiError('Permintaan tidak ditemukan', 404);
  if (permintaan.status !== 'pending') throw new ApiError('Permintaan sudah diproses', 409);

  permintaan.status = 'ditolak';
  await permintaan.save();

  await Notifikasi.create({
    id_jamaah: permintaan.id_jamaah,
    judul: 'Permintaan bergabung ditolak',
    pesan:
      'Mohon maaf, permintaan bergabung kelompok Anda belum dapat diterima. ' +
      'Anda dapat mengajukan permintaan kembali.',
    tipe: 'kelompok',
  });

  ok(res, permintaan, 'Permintaan bergabung ditolak');
});
