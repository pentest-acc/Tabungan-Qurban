const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/jamaah', require('./jamaahRoutes'));
router.use('/sapi', require('./sapiRoutes'));
router.use('/kelompok', require('./kelompokRoutes'));
router.use('/permintaan', require('./permintaanRoutes'));
router.use('/tabungan', require('./tabunganRoutes'));
router.use('/transaksi', require('./transaksiRoutes'));
router.use('/laporan', require('./laporanRoutes'));

module.exports = router;
