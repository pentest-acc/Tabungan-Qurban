import axiosClient from '../api/axiosClient';

// CRUD akun admin biasa (khusus kepala admin)
const adminService = {
  getAll: () => axiosClient.get('/admin'),
  // { username, password, nama_lengkap, role: 'admin_biasa' }
  create: (payload) => axiosClient.post('/admin', payload),
  update: (id, payload) => axiosClient.put(`/admin/${id}`, payload),
  remove: (id) => axiosClient.delete(`/admin/${id}`),
};

export default adminService;
