const router = require('express').Router();
const jamaahController = require('../controllers/jamaahController');
const { authenticate, authorize, ADMIN_ROLES } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerJamaahRules, updateJamaahRules } = require('../validators');

router.use(authenticate);

// Jamaah memperbarui profilnya sendiri (harus sebelum '/:id')
router.put('/profil', authorize('jamaah'), updateJamaahRules, validate, jamaahController.updateProfil);

// Pengelolaan data jamaah oleh admin
router.get('/', authorize(...ADMIN_ROLES), jamaahController.getAll);
router.get('/:id', authorize(...ADMIN_ROLES), jamaahController.getById);
router.post('/', authorize(...ADMIN_ROLES), registerJamaahRules, validate, jamaahController.create);
router.put('/:id', authorize(...ADMIN_ROLES), updateJamaahRules, validate, jamaahController.update);
router.delete('/:id', authorize(...ADMIN_ROLES), jamaahController.remove);

module.exports = router;
