const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { adminRules, updateAdminRules } = require('../validators');

// CRUD admin biasa — khusus kepala admin
router.use(authenticate, authorize('kepala_admin'));

router.get('/', adminController.getAll);
router.post('/', adminRules, validate, adminController.create);
router.put('/:id', updateAdminRules, validate, adminController.update);
router.delete('/:id', adminController.remove);

module.exports = router;
