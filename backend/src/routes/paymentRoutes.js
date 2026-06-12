const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { transaksiRules } = require('../validators');

// Webhook dari payment gateway: TANPA auth JWT (gateway eksternal tidak punya
// token), diamankan dengan signature HMAC di paymentService.verifikasiSignature.
router.post('/webhook', paymentController.webhook);

router.use(authenticate);

// Jamaah membuat checkout dan memantau statusnya
router.post('/checkout', authorize('jamaah'), transaksiRules, validate, paymentController.checkout);
router.get('/status/:ref', authorize('jamaah', ...ADMIN_ROLES), paymentController.status);
router.get('/receipt/:ref', authorize('jamaah', ...ADMIN_ROLES), paymentController.receipt);

// Simulator sandbox (pengganti gateway asli saat pengembangan/demo)
router.post('/simulate/:ref', authorize('jamaah', ...ADMIN_ROLES), paymentController.simulate);

module.exports = router;
