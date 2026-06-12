const router = require('express').Router();
const broadcastController = require('../controllers/broadcastController');
const { authenticate } = require('../middleware/auth');

// Semua role yang login (jamaah, admin biasa, kepala admin) melihat broadcast.
router.use(authenticate);

router.get('/pembayaran', broadcastController.pembayaranTerbaru);

module.exports = router;
