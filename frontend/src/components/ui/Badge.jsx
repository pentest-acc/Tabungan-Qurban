const VARIANTS = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function Badge({ children, variant = 'gray' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant] || VARIANTS.gray}`}
    >
      {children}
    </span>
  );
}

// Pemetaan status umum ke warna badge
export function statusVariant(status) {
  const s = String(status || '').toLowerCase();
  if (['aktif', 'active', 'sukses', 'success', 'berhasil', 'diterima', 'lunas', 'approved'].includes(s)) return 'green';
  if (['pending', 'menunggu', 'menunggu persetujuan', 'proses', 'cicil'].includes(s)) return 'yellow';
  if (['expired', 'gagal', 'failed', 'ditolak', 'batal', 'rejected', 'nonaktif'].includes(s)) return 'red';
  if (['penuh', 'tunai', 'selesai'].includes(s)) return 'blue';
  return 'gray';
}
