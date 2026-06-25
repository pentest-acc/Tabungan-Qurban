const router = require('express').Router();
const feedbackController = require('../controllers/feedbackController');

// Publik — siapa pun (termasuk yang belum login) dapat mengirim laporan/saran.
router.post('/', feedbackController.buat);

module.exports = router;
