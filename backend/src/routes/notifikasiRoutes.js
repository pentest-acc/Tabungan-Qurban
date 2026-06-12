const router = require('express').Router();
const notifikasiController = require('../controllers/notifikasiController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('jamaah'));

router.get('/', notifikasiController.getMine);
router.put('/baca', notifikasiController.tandaiBaca);

module.exports = router;
