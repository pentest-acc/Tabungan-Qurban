import axiosClient from '../api/axiosClient';

// Permintaan bergabung kelompok (status: pending / diterima / ditolak)
const permintaanService = {
  getAll: () => axiosClient.get('/permintaan'),
  // admin menentukan kelompok penempatan: { id_kelompok }
  terima: (id, payload = {}) => axiosClient.put(`/permintaan/${id}/terima`, payload),
  tolak: (id) => axiosClient.put(`/permintaan/${id}/tolak`),
};

export default permintaanService;
