import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#keamanan', label: 'Keamanan' },
  { href: '#lokasi', label: 'Lokasi' },
];

export default function PublicNavbar() {
  const { user, homePathFor } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tutup = () => setMenuOpen(false);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'border-b border-white/40 bg-white/80 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/80'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={tutup} className="group flex items-center gap-2">
          <img
            src="/logo-masjid.png"
            alt="Logo Tabungan Qurban"
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight sm:text-lg">Tabungan Qurban</span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Masjid Jami Nurul Hikmah
            </span>
          </span>
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

          {/* Aksi auth — desktop */}
          <div className="hidden items-center gap-2 md:flex">
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
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/5"
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

          {/* Tombol menu — mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-900/5 md:hidden dark:text-slate-300 dark:hover:bg-white/5"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu dropdown — mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-slate-950/95"
          >
            <div className="space-y-1 px-4 py-3 sm:px-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={tutup}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
                {user ? (
                  <Link to={homePathFor(user.role)} onClick={tutup} className="btn-primary flex-1 justify-center">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={tutup} className="btn-secondary flex-1 justify-center">
                      Masuk
                    </Link>
                    <Link to="/register" onClick={tutup} className="btn-primary flex-1 justify-center">
                      Daftar Gratis
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
