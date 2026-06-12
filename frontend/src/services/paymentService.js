import axiosClient from '../api/axiosClient';

const paymentService = {
  // { id_tabungan, total_bayar, metode_bayar, jenis_transaksi } ->
  // { nomor_referensi, kode_bayar, instruksi[], kadaluarsa, status_pembayaran }
  checkout: (payload) => axiosClient.post('/payment/checkout', payload),
  getStatus: (nomorReferensi) => axiosClient.get(`/payment/status/${nomorReferensi}`),
  // Data kwitansi internal (bukti pembayaran)
  getReceipt: (nomorReferensi) => axiosClient.get(`/payment/receipt/${nomorReferensi}`),
  // Simulator sandbox: berperan sebagai gateway yang mengirim webhook
  simulate: (nomorReferensi, hasil) =>
    axiosClient.post(`/payment/simulate/${nomorReferensi}`, { hasil }),
};

export default paymentService;
