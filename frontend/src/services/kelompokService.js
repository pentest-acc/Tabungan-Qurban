import axiosClient from '../api/axiosClient';

const kelompokService = {
  getAll: () => axiosClient.get('/kelompok'),
  getById: (id) => axiosClient.get(`/kelompok/${id}`),
  // { id_sapi, nomor_kelompok, tanggal_mulai, tanggal_berakhir, status }
  create: (payload) => axiosClient.post('/kelompok', payload),
  update: (id, payload) => axiosClient.put(`/kelompok/${id}`, payload),
  remove: (id) => axiosClient.delete(`/kelompok/${id}`),
  // anggota kelompok (Detail_Kelompok)
  getAnggota: (id) => axiosClient.get(`/kelompok/${id}/anggota`),
  // jamaah mengajukan permintaan bergabung (admin yang menentukan kelompok)
  ajukanGabung: (payload = {}) => axiosClient.post('/kelompok/gabung', payload),
  // status permintaan gabung milik jamaah yang login
  statusGabung: () => axiosClient.get('/kelompok/gabung/status'),
};

export default kelompokService;
