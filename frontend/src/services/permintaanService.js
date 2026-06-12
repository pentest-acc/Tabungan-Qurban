import axiosClient from '../api/axiosClient';

// Permintaan bergabung kelompok (status: pending / diterima / ditolak)
const permintaanService = {
  getAll: () => axiosClient.get('/permintaan'),
  terima: (id) => axiosClient.put(`/permintaan/${id}/terima`),
  tolak: (id) => axiosClient.put(`/permintaan/${id}/tolak`),
};

export default permintaanService;
