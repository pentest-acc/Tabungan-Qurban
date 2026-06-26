const router = require('express').Router();
const feedbackController = require('../controllers/feedbackController');
const uploadProfil = require('../middleware/uploadProfil');

// Publik — siapa pun (termasuk yang belum login) dapat mengirim laporan/saran.
// Lampiran gambar/berkas opsional lewat field "lampiran".
router.post('/', uploadProfil.single('lampiran'), feedbackController.buat);

module.exports = router;
