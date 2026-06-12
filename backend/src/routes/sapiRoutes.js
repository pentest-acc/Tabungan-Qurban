const router = require('express').Router();
const sapiController = require('../controllers/sapiController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sapiRules } = require('../validators');

router.use(authenticate);

// Semua user login boleh melihat katalog sapi
router.get('/', sapiController.getAll);
router.get('/:id', sapiController.getById);

// Pengelolaan hanya untuk admin
router.post('/', authorize(...ADMIN_ROLES), sapiRules, validate, sapiController.create);
router.put('/:id', authorize(...ADMIN_ROLES), sapiController.update);
router.delete('/:id', authorize(...ADMIN_ROLES), sapiController.remove);

module.exports = router;
