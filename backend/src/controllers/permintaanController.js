const PermintaanGabung = require('../models/PermintaanGabung');
const DetailKelompok = require('../models/DetailKelompok');
const KelompokQurban = require('../models/KelompokQurban');
const Jamaah = require('../models/Jamaah');
const { KUOTA_MAKSIMAL } = require('../services/kelompokService');
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
        KelompokQurban.findOne({ id_kelompok: permintaan.id_kelompok })
          .select('id_kelompok nomor_kelompok status')
          .lean(),
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

// PUT /api/permintaan/:id/terima — masukkan jamaah ke detail kelompok
exports.terima = asyncHandler(async (req, res) => {
  const permintaan = await PermintaanGabung.findOne({ id_permintaan: req.params.id });
  if (!permintaan) throw new ApiError('Permintaan tidak ditemukan', 404);
  if (permintaan.status !== 'pending') throw new ApiError('Permintaan sudah diproses', 409);

  const jumlahAnggota = await DetailKelompok.countDocuments({ id_kelompok: permintaan.id_kelompok });
  if (jumlahAnggota >= KUOTA_MAKSIMAL) {
    permintaan.status = 'ditolak';
    await permintaan.save();
    throw new ApiError('Kuota 7 anggota sudah penuh, permintaan dibatalkan', 409);
  }

  await DetailKelompok.create({
    id_kelompok: permintaan.id_kelompok,
    id_jamaah: permintaan.id_jamaah,
  });
  permintaan.status = 'diterima';
  await permintaan.save();

  ok(res, permintaan, 'Jamaah diterima dan dimasukkan ke kelompok');
});

// PUT /api/permintaan/:id/tolak
exports.tolak = asyncHandler(async (req, res) => {
  const permintaan = await PermintaanGabung.findOne({ id_permintaan: req.params.id });
  if (!permintaan) throw new ApiError('Permintaan tidak ditemukan', 404);
  if (permintaan.status !== 'pending') throw new ApiError('Permintaan sudah diproses', 409);

  permintaan.status = 'ditolak';
  await permintaan.save();
  ok(res, permintaan, 'Permintaan bergabung ditolak');
});
