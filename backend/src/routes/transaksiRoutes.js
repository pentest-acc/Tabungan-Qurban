const router = require('express').Router();
const transaksiController = require('../controllers/transaksiController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { transaksiRules, statusTransaksiRules } = require('../validators');

router.use(authenticate);

// Riwayat milik jamaah (harus sebelum '/:id')
router.get('/saya', authorize('jamaah'), transaksiController.getMine);

// Jamaah membayar; "bukti" = file gambar opsional (multipart/form-data)
router.post(
  '/bayar',
  authorize('jamaah'),
  upload.single('bukti'),
  transaksiRules,
  validate,
  transaksiController.bayar
);

// Monitoring & koreksi oleh admin
router.get('/', authorize(...ADMIN_ROLES), transaksiController.getAll);
router.get('/:id', transaksiController.getById);
router.put(
  '/:id/status',
  authorize(...ADMIN_ROLES),
  statusTransaksiRules,
  validate,
  transaksiController.updateStatus
);
router.delete('/:id', authorize(...ADMIN_ROLES), transaksiController.remove);

module.exports = router;
