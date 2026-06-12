import axiosClient from '../api/axiosClient';

const sapiService = {
  getAll: () => axiosClient.get('/sapi'),
  getById: (id) => axiosClient.get(`/sapi/${id}`),
  // { penanda_sapi, bobot_estimasi, harga_sapi, harga_porsi }
  create: (payload) => axiosClient.post('/sapi', payload),
  update: (id, payload) => axiosClient.put(`/sapi/${id}`, payload),
  remove: (id) => axiosClient.delete(`/sapi/${id}`),
};

export default sapiService;
