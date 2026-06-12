import axiosClient from '../api/axiosClient';

const laporanService = {
  // ringkasan keseluruhan: total jamaah, kelompok, sapi, dana terkumpul, transaksi
  getRingkasan: () => axiosClient.get('/laporan/ringkasan'),
  // laporan per kelompok: progres tabungan & status
  getPerKelompok: () => axiosClient.get('/laporan/kelompok'),
};

export default laporanService;
