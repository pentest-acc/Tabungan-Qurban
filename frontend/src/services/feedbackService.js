import axiosClient from '../api/axiosClient';

// Kirim laporan bug/saran ke developer (endpoint publik). Memakai FormData agar
// bisa menyertakan lampiran gambar; field teks tetap ikut terkirim.
const feedbackService = {
  kirim: (formData) =>
    axiosClient.post('/feedback', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default feedbackService;
