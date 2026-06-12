import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-7xl font-extrabold text-primary-600">404</p>
      <h1 className="text-2xl font-bold">Halaman Tidak Ditemukan</h1>
      <p className="text-slate-500 dark:text-slate-400">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link to="/" className="btn-primary">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
