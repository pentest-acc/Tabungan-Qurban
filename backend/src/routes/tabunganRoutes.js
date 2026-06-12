const router = require('express').Router();
const tabunganController = require('../controllers/tabunganController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');

router.use(authenticate);

router.get('/saya', authorize('jamaah'), tabunganController.getMine);
router.get('/kelompok/:id', authorize(...ADMIN_ROLES, 'jamaah'), tabunganController.getByKelompok);

module.exports = router;
