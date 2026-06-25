const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/jamaah', require('./jamaahRoutes'));
router.use('/sapi', require('./sapiRoutes'));
router.use('/kelompok', require('./kelompokRoutes'));
router.use('/permintaan', require('./permintaanRoutes'));
router.use('/tabungan', require('./tabunganRoutes'));
router.use('/transaksi', require('./transaksiRoutes'));
router.use('/payment', require('./paymentRoutes'));
router.use('/notifikasi', require('./notifikasiRoutes'));
router.use('/broadcast', require('./broadcastRoutes'));
router.use('/laporan', require('./laporanRoutes'));
router.use('/profil', require('./profilRoutes'));
router.use('/feedback', require('./feedbackRoutes'));

module.exports = router;
