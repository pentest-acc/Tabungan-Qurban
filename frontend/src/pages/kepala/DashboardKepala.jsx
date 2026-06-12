import { Link } from 'react-router-dom';
import {
  UsersIcon,
  UserGroupIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import laporanService from '../../services/laporanService';
import jamaahService from '../../services/jamaahService';
import sapiService from '../../services/sapiService';
import kelompokService from '../../services/kelompokService';
import transaksiService from '../../services/transaksiService';
import adminService from '../../services/adminService';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { formatRupiah } from '../../utils/format';

const asList = (r) => (r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : r.value?.data ?? []) : []);

export default function DashboardKepala() {
  const { user } = useAuth();
  const stats = useFetch(async () => {
    // Gunakan endpoint laporan jika tersedia; jika tidak, hitung dari data mentah.
    try {
      const ringkasan = await laporanService.getRingkasan();
      return ringkasan?.data ?? ringkasan;
    } catch {
      const [jamaah, sapi, kelompok, transaksi, admin] = await Promise.allSettled([
        jamaahService.getAll(),
        sapiService.getAll(),
        kelompokService.getAll(),
        transaksiService.getAll(),
        adminService.getAll(),
      ]);
      const transaksiList = asList(transaksi);
      return {
        total_jamaah: asList(jamaah).length,
        total_sapi: asList(sapi).length,
        total_kelompok: asList(kelompok).length,
        total_transaksi: transaksiList.length,
        total_dana: transaksiList.reduce((sum, t) => sum + (Number(t.total_bayar) || 0), 0),
        total_admin: asList(admin).length,
      };
    }
  }, []);

  if (stats.loading) return <LoadingState />;
  if (stats.error) return <ErrorState message={stats.error} onRetry={stats.refetch} />;

  const d = stats.data ?? {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard Kepala Admin</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Selamat datang {user?.nama_lengkap || user?.username}, berikut ringkasan keseluruhan sistem.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={BanknotesIcon} label="Total Dana Terkumpul" value={formatRupiah(d.total_dana ?? 0)} />
        <StatCard icon={UsersIcon} label="Total Jamaah" value={d.total_jamaah ?? 0} accent="bg-blue-500" />
        <StatCard icon={ShieldCheckIcon} label="Total Admin" value={d.total_admin ?? 0} accent="bg-violet-500" />
        <StatCard icon={UserGroupIcon} label="Kelompok Qurban" value={d.total_kelompok ?? 0} accent="bg-amber-500" />
        <StatCard icon={SparklesIcon} label="Sapi Qurban" value={d.total_sapi ?? 0} accent="bg-rose-500" />
        <StatCard icon={ChartBarIcon} label="Total Transaksi" value={d.total_transaksi ?? 0} accent="bg-teal-500" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/kepala/laporan" className="btn-primary">
          <ChartBarIcon className="h-5 w-5" />
          Lihat Laporan Keseluruhan
        </Link>
        <Link to="/kepala/admin" className="btn-secondary">
          <ShieldCheckIcon className="h-5 w-5" />
          Kelola Admin Biasa
        </Link>
      </div>
    </div>
  );
}
