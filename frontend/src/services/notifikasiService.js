import axiosClient from '../api/axiosClient';

const notifikasiService = {
  // -> { notifikasi: [...], belum_dibaca: n }
  getMine: () => axiosClient.get('/notifikasi'),
  tandaiBaca: () => axiosClient.put('/notifikasi/baca'),
};

export default notifikasiService;
