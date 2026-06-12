import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/format';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Buka menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2">
        {user?.role === 'jamaah' && <NotificationBell />}
        <ThemeToggle />
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <UserCircleIcon className="h-8 w-8 text-slate-400" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.nama_lengkap || user?.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ROLE_LABELS[user?.role] || 'Pengguna'}</p>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
          </button>
          {dropdownOpen && (
            <div className="card absolute right-0 mt-2 w-48 overflow-hidden py-1">
              {user?.role === 'jamaah' && (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/jamaah/profil');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UserCircleIcon className="h-4 w-4" />
                  Profil Saya
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-800"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
