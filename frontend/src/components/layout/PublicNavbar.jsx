import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function PublicNavbar() {
  const { user, homePathFor } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-masjid.png" alt="Logo Tabungan Qurban" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold">Tabungan Qurban</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to={homePathFor(user.role)} className="btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Masuk
              </Link>
              <Link to="/register" className="btn-primary">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
