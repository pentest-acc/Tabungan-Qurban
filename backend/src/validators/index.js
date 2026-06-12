const { body } = require('express-validator');

exports.loginRules = [
  body('username').trim().notEmpty().withMessage('Username wajib diisi'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
];

exports.registerJamaahRules = [
  body('username').trim().isLength({ min: 4 }).withMessage('Username minimal 4 karakter'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('nama_lengkap').trim().notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('no_telp')
    .trim()
    .matches(/^[0-9+\-\s]{8,16}$/)
    .withMessage('Format nomor telepon tidak valid'),
  body('alamat').optional().isString(),
];

exports.updateJamaahRules = [
  body('username').optional().trim().isLength({ min: 4 }).withMessage('Username minimal 4 karakter'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('nama_lengkap').optional().trim().notEmpty().withMessage('Nama lengkap tidak boleh kosong'),
  body('no_telp')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s]{8,16}$/)
    .withMessage('Format nomor telepon tidak valid'),
];

exports.adminRules = [
  body('username').trim().isLength({ min: 4 }).withMessage('Username minimal 4 karakter'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('nama_lengkap').trim().notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('role').optional().isIn(['admin_biasa', 'kepala_admin']).withMessage('Role tidak valid'),
];

exports.updateAdminRules = [
  body('username').optional().trim().isLength({ min: 4 }).withMessage('Username minimal 4 karakter'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('nama_lengkap').optional().trim().notEmpty().withMessage('Nama lengkap tidak boleh kosong'),
  body('role').optional().isIn(['admin_biasa', 'kepala_admin']).withMessage('Role tidak valid'),
];

exports.sapiRules = [
  body('penanda_sapi').trim().notEmpty().withMessage('Penanda sapi wajib diisi'),
  body('bobot_estimasi').isFloat({ min: 1 }).withMessage('Bobot estimasi harus angka positif'),
  body('harga_sapi').optional().isFloat({ min: 1 }).withMessage('Harga sapi harus angka positif'),
  body('harga_porsi').optional().isFloat({ min: 1 }).withMessage('Harga porsi harus angka positif'),
];

exports.kelompokRules = [
  body('nomor_kelompok').trim().notEmpty().withMessage('Nomor kelompok wajib diisi'),
  body('id_sapi').trim().notEmpty().withMessage('Sapi wajib dipilih'),
  body('tanggal_mulai').isISO8601().withMessage('Tanggal mulai tidak valid'),
  body('tanggal_berakhir')
    .isISO8601()
    .withMessage('Tanggal berakhir tidak valid')
    .custom((value, { req }) => {
      if (req.body.tanggal_mulai && new Date(value) <= new Date(req.body.tanggal_mulai)) {
        throw new Error('Tanggal berakhir harus setelah tanggal mulai');
      }
      return true;
    }),
  body('status').optional().isIn(['Aktif', 'Penuh', 'Expired']).withMessage('Status tidak valid'),
];

exports.transaksiRules = [
  body('id_tabungan').trim().notEmpty().withMessage('ID tabungan wajib diisi'),
  body('total_bayar').isFloat({ min: 10000 }).withMessage('Minimal setoran Rp 10.000'),
  body('metode_bayar').trim().notEmpty().withMessage('Metode bayar wajib diisi'),
  body('jenis_transaksi').isIn(['tunai', 'cicil']).withMessage("Jenis transaksi harus 'tunai' atau 'cicil'"),
];

exports.statusTransaksiRules = [
  body('status').isIn(['pending', 'sukses', 'gagal']).withMessage('Status tidak valid'),
];
