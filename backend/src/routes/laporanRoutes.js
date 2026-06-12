const router = require('express').Router();
const laporanController = require('../controllers/laporanController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');

// Laporan — admin (kepala admin melihat keseluruhan, admin biasa boleh memantau)
router.use(authenticate, authorize(...ADMIN_ROLES));

router.get('/ringkasan', laporanController.ringkasan);
router.get('/kelompok', laporanController.perKelompok);

module.exports = router;
