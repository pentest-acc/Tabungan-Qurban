const router = require('express').Router();
const profilController = require('../controllers/profilController');
const { authenticate } = require('../middleware/auth');
const uploadProfil = require('../middleware/uploadProfil');

// Semua pengguna login (jamaah/admin/kepala admin) mengelola media profilnya sendiri.
router.use(authenticate);

router.get('/me', profilController.getMine);
router.put('/me', uploadProfil.single('foto'), profilController.updateMine);

module.exports = router;
