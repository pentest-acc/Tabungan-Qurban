import axiosClient from '../api/axiosClient';

const transaksiService = {
  // monitoring semua transaksi (admin)
  getAll: () => axiosClient.get('/transaksi'),
  // riwayat transaksi milik jamaah yang login
  getMine: () => axiosClient.get('/transaksi/saya'),
  getById: (id) => axiosClient.get(`/transaksi/${id}`),
  // { id_tabungan, total_bayar, metode_bayar, jenis_transaksi: 'tunai'|'cicil' }
  bayar: (payload) => axiosClient.post('/transaksi/bayar', payload),
};

export default transaksiService;
