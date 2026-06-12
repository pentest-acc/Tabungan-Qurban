import axiosClient from '../api/axiosClient';

const tabunganService = {
  // tagihan & tabungan kelompok milik jamaah yang login
  getMine: () => axiosClient.get('/tabungan/saya'),
  getByKelompok: (idKelompok) => axiosClient.get(`/tabungan/kelompok/${idKelompok}`),
};

export default tabunganService;
