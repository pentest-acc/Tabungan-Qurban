import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const MENUS = {
  jamaah: [
    { to: '/jamaah/dashboard', label: 'Dashboard', icon: HomeIcon },
    { to: '/jamaah/kelompok', label: 'Kelompok Qurban', icon: UserGroupIcon },
    { to: '/jamaah/tagihan', label: 'Tagihan Saya', icon: BanknotesIcon },
    { to: '/jamaah/transaksi', label: 'Riwayat Transaksi', icon: ClipboardDocumentListIcon },
    { to: '/jamaah/profil', label: 'Profil', icon: UserCircleIcon },
  ],
  admin_biasa: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
    { to: '/admin/jamaah', label: 'Data Jamaah', icon: UsersIcon },
    { to: '/admin/sapi', label: 'Sapi Qurban', icon: SparklesIcon },
    { to: '/admin/kelompok', label: 'Kelompok Qurban', icon: UserGroupIcon },
    { to: '/admin/permintaan', label: 'Permintaan Gabung', icon: CheckBadgeIcon },
    { to: '/admin/transaksi', label: 'Monitoring Transaksi', icon: CreditCardIcon },
    { to: '/admin/profil', label: 'Profil', icon: UserCircleIcon },
  ],
  kepala_admin: [
    { to: '/kepala/dashboard', label: 'Dashboard', icon: HomeIcon },
    { to: '/kepala/admin', label: 'Kelola Admin', icon: ShieldCheckIcon },
    { to: '/kepala/laporan', label: 'Laporan Keseluruhan', icon: ChartBarIcon },
    { to: '/admin/jamaah', label: 'Data Jamaah', icon: UsersIcon },
    { to: '/admin/sapi', label: 'Sapi Qurban', icon: SparklesIcon },
    { to: '/admin/kelompok', label: 'Kelompok Qurban', icon: UserGroupIcon },
    { to: '/admin/permintaan', label: 'Permintaan Gabung', icon: CheckBadgeIcon },
    { to: '/admin/transaksi', label: 'Monitoring Transaksi', icon: CreditCardIcon },
    { to: '/admin/profil', label: 'Profil', icon: UserCircleIcon },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const menu = MENUS[user?.role] || MENUS.jamaah;

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <img src="/logo-masjid.png" alt="Logo Tabungan Qurban" className="h-10 w-10 object-contain" />
            <div>
              <p className="text-sm font-bold leading-tight">Tabungan Qurban</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Masjid Jami Nurul Hikmah</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Tabungan Qurban
        </div>
      </aside>
    </>
  );
}
