// Katalog border profil beranimasi ala Discord.
// `key` HARUS sinkron dengan BORDER_VALID di backend (profilController.js).
export const BORDER_PROFIL = [
  { key: 'none', label: 'Tanpa Border' },
  { key: 'emerald', label: 'Emerald Pulse' },
  { key: 'rainbow', label: 'Pelangi' },
  { key: 'gold', label: 'Emas' },
  { key: 'neon', label: 'Neon Cyan' },
  { key: 'fire', label: 'Api' },
  { key: 'aurora', label: 'Aurora' },
  { key: 'royal', label: 'Royal Ungu' },
];

export const BORDER_KEYS = BORDER_PROFIL.map((b) => b.key);
