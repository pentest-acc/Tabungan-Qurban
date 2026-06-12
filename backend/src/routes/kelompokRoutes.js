const router = require('express').Router();
const kelompokController = require('../controllers/kelompokController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { kelompokRules } = require('../validators');

router.use(authenticate);

// Semua user login boleh melihat kelompok
router.get('/', kelompokController.getAll);
router.get('/:id', kelompokController.getById);
router.get('/:id/anggota', kelompokController.getAnggota);

// Jamaah mengajukan permintaan bergabung
router.post('/:id/gabung', authorize('jamaah'), kelompokController.ajukanGabung);

// Pengelolaan hanya untuk admin
router.post('/', authorize(...ADMIN_ROLES), kelompokRules, validate, kelompokController.create);
router.put('/:id', authorize(...ADMIN_ROLES), kelompokController.update);
router.delete('/:id', authorize(...ADMIN_ROLES), kelompokController.remove);

module.exports = router;
