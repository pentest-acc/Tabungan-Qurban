const Notifikasi = require('../models/Notifikasi');
const { ok, asyncHandler } = require('../utils/response');

// GET /api/notifikasi — notifikasi milik jamaah yang login (terbaru dulu)
exports.getMine = asyncHandler(async (req, res) => {
  const list = await Notifikasi.find({ id_jamaah: req.user.id_jamaah })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  const belumDibaca = list.filter((n) => !n.dibaca).length;
  ok(res, { notifikasi: list, belum_dibaca: belumDibaca });
});

// PUT /api/notifikasi/baca — tandai semua notifikasi sudah dibaca
exports.tandaiBaca = asyncHandler(async (req, res) => {
  await Notifikasi.updateMany(
    { id_jamaah: req.user.id_jamaah, dibaca: false },
    { dibaca: true }
  );
  ok(res, null, 'Semua notifikasi ditandai sudah dibaca');
});
