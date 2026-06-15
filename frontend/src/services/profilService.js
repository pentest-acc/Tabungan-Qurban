import axiosClient from '../api/axiosClient';

// Media profil (foto/video + border beranimasi). Upload memakai multipart agar
// bisa mengirim berkas; Content-Type dibiarkan diatur otomatis oleh browser.
const profilService = {
  getMine: () => axiosClient.get('/profil/me'),
  update: (formData) =>
    axiosClient.put('/profil/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default profilService;
