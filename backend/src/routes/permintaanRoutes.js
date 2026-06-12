const router = require('express').Router();
const permintaanController = require('../controllers/permintaanController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');

// Validasi permintaan bergabung — khusus admin
router.use(authenticate, authorize(...ADMIN_ROLES));

router.get('/', permintaanController.getAll);
router.put('/:id/terima', permintaanController.terima);
router.put('/:id/tolak', permintaanController.tolak);

module.exports = router;
