import { Link } from 'react-router-dom';
import {
  UsersIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckBadgeIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import jamaahService from '../../services/jamaahService';
import sapiService from '../../services/sapiService';
import kelompokService from '../../services/kelompokService';
import permintaanService from '../../services/permintaanService';
import transaksiService from '../../services/transaksiService';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatRupiah, formatDateTime } from '../../utils/format';

const asList = (res) => (Array.isArray(res) ? res : res?.data ?? []);

export default function DashboardAdmin() {
  const { user } = useAuth();
  const stats = useFetch(async () => {
    const [jamaah, sapi, kelompok, permintaan, transaksi] = await Promise.allSettled([
      jamaahService.getAll(),
      sapiService.getAll(),
      kelompokService.getAll(),
      permintaanService.getAll(),
      transaksiService.getAll(),
    ]);
    const value = (r) => (r.status === 'fulfilled' ? asList(r.value) : []);
    return {
      jamaah: value(jamaah),
      sapi: value(sapi),
      kelompok: value(kelompok),
      permintaan: value(permintaan),
      transaksi: value(transaksi),
    };
  }, []);

  if (stats.loading) return <LoadingState />;
  if (stats.error) return <ErrorState message={stats.error} onRetry={stats.refetch} />;

  const { jamaah, sapi, kelompok, permintaan, transaksi } = stats.data;
  const pendingCount = permintaan.filter(
    (p) => ['pending', 'menunggu', 'menunggu persetujuan'].includes(String(p.status || '').toLowerCase())
  ).length;
  const transaksiTerbaru = [...transaksi]
    .sort((a, b) => new Date(b.tanggal_bayar) - new Date(a.tanggal_bayar))
    .slice(0, 6);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Halo {user?.nama_lengkap || user?.username}, berikut ringkasan sistem hari ini.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UsersIcon} label="Total Jamaah" value={jamaah.length} />
        <StatCard icon={SparklesIcon} label="Sapi Qurban" value={sapi.length} accent="bg-amber-500" />
        <StatCard icon={UserGroupIcon} label="Kelompok Qurban" value={kelompok.length} accent="bg-blue-500" />
        <StatCard
          icon={CheckBadgeIcon}
          label="Permintaan Pending"
          value={pendingCount}
          accent="bg-rose-500"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/admin/permintaan" className="btn-primary">
          <CheckBadgeIcon className="h-5 w-5" />
          Validasi Permintaan ({pendingCount})
        </Link>
        <Link to="/admin/kelompok" className="btn-secondary">
          <UserGroupIcon className="h-5 w-5" />
          Kelola Kelompok
        </Link>
        <Link to="/admin/transaksi" className="btn-secondary">
          <BanknotesIcon className="h-5 w-5" />
          Monitoring Transaksi
        </Link>
      </div>

      <div className="card mt-8">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold">Transaksi Terbaru</h2>
          <Link to="/admin/transaksi" className="text-sm font-medium text-primary-600 hover:underline">
            Lihat Semua
          </Link>
        </div>
        {transaksiTerbaru.length === 0 ? (
          <EmptyState title="Belum Ada Transaksi" message="Transaksi jamaah akan tampil di sini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="table-th">ID</th>
                  <th className="table-th">Jamaah</th>
                  <th className="table-th">Tanggal</th>
                  <th className="table-th">Jumlah</th>
                  <th className="table-th">Jenis</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {transaksiTerbaru.map((trx) => (
                  <tr key={trx.id_transaksi || trx._id}>
                    <td className="table-td font-mono text-xs">{trx.id_transaksi || trx._id}</td>
                    <td className="table-td">{trx.jamaah?.nama_lengkap || trx.nama_jamaah || trx.id_jamaah || '-'}</td>
                    <td className="table-td">{formatDateTime(trx.tanggal_bayar)}</td>
                    <td className="table-td font-semibold">{formatRupiah(trx.total_bayar)}</td>
                    <td className="table-td">
                      <Badge variant={statusVariant(trx.jenis_transaksi)}>{trx.jenis_transaksi || '-'}</Badge>
                    </td>
                    <td className="table-td">
                      <Badge variant={statusVariant(trx.status_pembayaran)}>
                        {trx.status_pembayaran || '-'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
