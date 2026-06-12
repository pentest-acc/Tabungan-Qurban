import axiosClient from '../api/axiosClient';

const authService = {
  // { username, password } -> { token, user: { id, username, nama_lengkap, role } }
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  // { username, password, nama_lengkap, no_telp, alamat }
  register: (payload) => axiosClient.post('/auth/register', payload),
  me: () => axiosClient.get('/auth/me'),
};

export default authService;
