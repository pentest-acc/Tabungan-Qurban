import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#keamanan', label: 'Keamanan' },
];

export default function PublicNavbar() {
  const { user, homePathFor } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/40 bg-white/70 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <img
            src="/logo-masjid.png"
            alt="Logo Tabungan Qurban"
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
          <span className="text-lg font-bold tracking-tight">Tabungan Qurban</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              to={homePathFor(user.role)}
              className="btn-primary !rounded-full !px-5 shadow-lg shadow-primary-600/25 transition-transform hover:-translate-y-0.5"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-900/5 sm:block dark:text-slate-200 dark:hover:bg-white/5"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="btn-primary !rounded-full !px-5 shadow-lg shadow-primary-600/25 transition-transform hover:-translate-y-0.5"
              >
                Daftar Gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
