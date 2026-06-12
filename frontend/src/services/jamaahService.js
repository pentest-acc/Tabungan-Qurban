import axiosClient from '../api/axiosClient';

const jamaahService = {
  getAll: () => axiosClient.get('/jamaah'),
  getById: (id) => axiosClient.get(`/jamaah/${id}`),
  create: (payload) => axiosClient.post('/jamaah', payload),
  update: (id, payload) => axiosClient.put(`/jamaah/${id}`, payload),
  remove: (id) => axiosClient.delete(`/jamaah/${id}`),
  updateProfil: (payload) => axiosClient.put('/jamaah/profil', payload),
};

export default jamaahService;
