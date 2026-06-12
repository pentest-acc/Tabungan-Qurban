const KelompokQurban = require('../models/KelompokQurban');
const SapiQurban = require('../models/SapiQurban');
const TabunganQurban = require('../models/TabunganQurban');
const DetailKelompok = require('../models/DetailKelompok');
const PermintaanGabung = require('../models/PermintaanGabung');
const Transaksi = require('../models/Transaksi');
const { buatTabunganOtomatis } = require('../services/tabunganService');
const {
  KUOTA_MAKSIMAL,
  lengkapiKelompok,
  lengkapiSemuaKelompok,
  daftarAnggota,
} = require('../services/kelompokService');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// GET /api/kelompok — daftar kelompok (search ?q= dan filter ?status=)
exports.getAll = asyncHandler(async (req, res) => {
  const { q, status } = req.query;
  const filter = {};
  if (q) filter.nomor_kelompok = { $regex: q, $options: 'i' };
  if (status) filter.status = new RegExp(`^${status}$`, 'i');
  const list = await KelompokQurban.find(filter).sort({ createdAt: -1 }).lean();
  ok(res, await lengkapiSemuaKelompok(list));
});

// GET /api/kelompok/:id — detail kelompok + sapi + tabungan + anggota
exports.getById = asyncHandler(async (req, res) => {
  const kelompok = await KelompokQurban.findOne({ id_kelompok: req.params.id }).lean();
  if (!kelompok) throw new ApiError('Kelompok tidak ditemukan', 404);

  const lengkap = await lengkapiKelompok(kelompok);
  lengkap.anggota = await daftarAnggota(kelompok.id_kelompok);
  ok(res, lengkap);
});

// GET /api/kelompok/:id/anggota
exports.getAnggota = asyncHandler(async (req, res) => {
  ok(res, await daftarAnggota(req.params.id));
});

// POST /api/kelompok — buat kelompok + tabungan otomatis (relasi 1:1)
exports.create = asyncHandler(async (req, res) => {
  const { id_sapi, nomor_kelompok, tanggal_mulai, tanggal_berakhir, status } = req.body;

  const sapi = await SapiQurban.findOne({ id_sapi });
  if (!sapi) throw new ApiError('Sapi tidak ditemukan', 404);

  const sapiDipakai = await KelompokQurban.exists({ id_sapi, status: { $ne: 'expired' } });
  if (sapiDipakai) throw new ApiError('Sapi sudah dipilih oleh kelompok lain', 409);

  const kelompok = await KelompokQurban.create({
    id_sapi,
    nomor_kelompok,
    tanggal_mulai,
    tanggal_berakhir,
    status,
  });
  const tabungan = await buatTabunganOtomatis(kelompok);
  ok(res, { ...kelompok.toObject(), tabungan }, 'Kelompok dan tabungan berhasil dibuat', 201);
});

// PUT /api/kelompok/:id
exports.update = asyncHandler(async (req, res) => {
  const kelompok = await KelompokQurban.findOne({ id_kelompok: req.params.id });
  if (!kelompok) throw new ApiError('Kelompok tidak ditemukan', 404);

  const { id_sapi, nomor_kelompok, tanggal_mulai, tanggal_berakhir, status } = req.body;
  if (id_sapi && id_sapi !== kelompok.id_sapi) {
    const sapi = await SapiQurban.findOne({ id_sapi });
    if (!sapi) throw new ApiError('Sapi tidak ditemukan', 404);
    const sapiDipakai = await KelompokQurban.exists({
      id_sapi,
      status: { $ne: 'expired' },
      id_kelompok: { $ne: kelompok.id_kelompok },
    });
    if (sapiDipakai) throw new ApiError('Sapi sudah dipilih oleh kelompok lain', 409);
    kelompok.id_sapi = id_sapi;
  }
  if (nomor_kelompok) kelompok.nomor_kelompok = nomor_kelompok;
  if (tanggal_mulai) kelompok.tanggal_mulai = tanggal_mulai;
  if (tanggal_berakhir) kelompok.tanggal_berakhir = tanggal_berakhir;
  if (status) kelompok.status = status;
  await kelompok.save();
  ok(res, await lengkapiKelompok(kelompok.toObject()), 'Kelompok berhasil diperbarui');
});

// DELETE /api/kelompok/:id — bubarkan kelompok + hapus tabungan terkait
exports.remove = asyncHandler(async (req, res) => {
  const kelompok = await KelompokQurban.findOne({ id_kelompok: req.params.id });
  if (!kelompok) throw new ApiError('Kelompok tidak ditemukan', 404);

  const tabungan = await TabunganQurban.findOne({ id_kelompok: kelompok.id_kelompok });
  await Promise.all([
    tabungan ? Transaksi.deleteMany({ id_tabungan: tabungan.id_tabungan }) : Promise.resolve(),
    TabunganQurban.deleteMany({ id_kelompok: kelompok.id_kelompok }),
    DetailKelompok.deleteMany({ id_kelompok: kelompok.id_kelompok }),
    PermintaanGabung.deleteMany({ id_kelompok: kelompok.id_kelompok }),
    kelompok.deleteOne(),
  ]);
  ok(res, null, 'Kelompok dibubarkan beserta tabungan terkait');
});

// POST /api/kelompok/gabung — jamaah mengajukan permintaan bergabung TANPA
// memilih kelompok; admin yang menentukan penempatan saat menerima.
exports.ajukanGabung = asyncHandler(async (req, res) => {
  const idJamaah = req.user.id_jamaah;

  const sudahAnggota = await DetailKelompok.exists({ id_jamaah: idJamaah });
  if (sudahAnggota) throw new ApiError('Anda sudah tergabung dalam kelompok', 409);

  const sudahMengajukan = await PermintaanGabung.exists({
    id_jamaah: idJamaah,
    status: 'pending',
  });
  if (sudahMengajukan) throw new ApiError('Permintaan Anda sedang menunggu persetujuan admin', 409);

  // Pastikan masih ada kelompok aktif yang bisa menampung.
  const kelompokAktif = await KelompokQurban.find({ status: 'aktif' }).lean();
  let adaSlot = false;
  for (const kelompok of kelompokAktif) {
    const jumlah = await DetailKelompok.countDocuments({ id_kelompok: kelompok.id_kelompok });
    if (jumlah < KUOTA_MAKSIMAL) {
      adaSlot = true;
      break;
    }
  }
  if (!adaSlot) {
    throw new ApiError('Belum ada kelompok aktif dengan slot tersedia, coba lagi nanti', 409);
  }

  const permintaan = await PermintaanGabung.create({
    id_jamaah: idJamaah,
    catatan: req.body.catatan || '',
  });
  ok(res, permintaan, 'Permintaan terkirim, admin akan menentukan kelompok Anda', 201);
});

// GET /api/kelompok/gabung/status — status permintaan jamaah yang login
exports.statusGabung = asyncHandler(async (req, res) => {
  const permintaan = await PermintaanGabung.findOne({ id_jamaah: req.user.id_jamaah })
    .sort({ tanggal_pengajuan: -1 })
    .lean();
  const anggota = await DetailKelompok.findOne({ id_jamaah: req.user.id_jamaah }).lean();
  ok(res, { permintaan, sudah_tergabung: Boolean(anggota) });
});
