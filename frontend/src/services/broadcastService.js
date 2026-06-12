import axiosClient from '../api/axiosClient';

const broadcastService = {
  // Pembayaran sukses terbaru untuk running text global
  // -> [{ nama_jamaah, total_bayar, nomor_kelompok, jenis_transaksi, tier }]
  pembayaranTerbaru: () => axiosClient.get('/broadcast/pembayaran'),
};

export default broadcastService;
