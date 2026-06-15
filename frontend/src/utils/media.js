// Ubah path media menjadi URL yang bisa dimuat browser.
// - URL Cloudinary (diawali http) dipakai apa adanya.
// - Path relatif dari penyimpanan disk lokal (mis. /uploads/profil/x.png)
//   ditambah origin server (VITE_API_URL tanpa akhiran /api).
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${SERVER_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
