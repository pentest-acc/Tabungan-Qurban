import axiosClient from '../api/axiosClient';

// Kirim laporan bug/saran ke developer (endpoint publik).
const feedbackService = {
  kirim: (payload) => axiosClient.post('/feedback', payload),
};

export default feedbackService;
