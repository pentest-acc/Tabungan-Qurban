// Katalog bingkai (frame) profil beranimasi ala Discord / Mobile Legends.
// `key` HARUS sinkron dengan BORDER_VALID di backend (profilController.js)
// dan dengan kelas CSS `.avatar-frame--<key>` di index.css.
export const BORDER_PROFIL = [
  { key: 'none', label: 'Tanpa Bingkai' },
  { key: 'api', label: 'Api' },
  { key: 'petir', label: 'Petir' },
  { key: 'air', label: 'Air' },
  { key: 'emas', label: 'Emas' },
  { key: 'pelangi', label: 'Pelangi' },
  { key: 'aurora', label: 'Aurora' },
  { key: 'kosmik', label: 'Kosmik' },
];

export const BORDER_KEYS = BORDER_PROFIL.map((b) => b.key);
