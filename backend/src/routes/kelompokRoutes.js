const router = require('express').Router();
const kelompokController = require('../controllers/kelompokController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { kelompokRules } = require('../validators');

router.use(authenticate);

// Jamaah mengajukan permintaan bergabung (admin yang menentukan kelompok).
// Didaftarkan sebelum '/:id' agar tidak tertangkap sebagai parameter id.
router.post('/gabung', authorize('jamaah'), kelompokController.ajukanGabung);
router.get('/gabung/status', authorize('jamaah'), kelompokController.statusGabung);

// Semua user login boleh melihat kelompok
router.get('/', kelompokController.getAll);
router.get('/:id', kelompokController.getById);
router.get('/:id/anggota', kelompokController.getAnggota);

// Pengelolaan hanya untuk admin
router.post('/', authorize(...ADMIN_ROLES), kelompokRules, validate, kelompokController.create);
router.put('/:id', authorize(...ADMIN_ROLES), kelompokController.update);
router.delete('/:id', authorize(...ADMIN_ROLES), kelompokController.remove);

module.exports = router;
