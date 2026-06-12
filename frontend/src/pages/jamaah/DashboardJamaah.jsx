import { Link } from 'react-router-dom';
import {
  BanknotesIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import tabunganService from '../../services/tabunganService';
import transaksiService from '../../services/transaksiService';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatRupiah, formatDateTime } from '../../utils/format';

export default function DashboardJamaah() {
  const { user } = useAuth();
  const tabungan = useFetch(() => tabunganService.getMine(), []);
  const transaksi = useFetch(() => transaksiService.getMine(), []);

  const tabunganData = tabungan.data?.data ?? tabungan.data;
  const transaksiList = (transaksi.data?.data ?? transaksi.data ?? []).slice(0, 5);

  const totalTerkumpul = tabunganData?.total_terkumpul ?? 0;
  const sisaTagihan = tabunganData?.sisa_tagihan_kelompok ?? tabunganData?.sisa_tagihan ?? 0;
  const namaKelompok =
    tabunganData?.kelompok?.nomor_kelompok ?? tabunganData?.nomor_kelompok ?? null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Assalamu&apos;alaikum, {user?.nama_lengkap || user?.username} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pantau progres tabungan qurban Anda di sini.
        </p>
      </div>

      {tabungan.loading ? (
        <LoadingState />
      ) : tabungan.error ? (
        <ErrorState message={tabungan.error} onRetry={tabungan.refetch} />
      ) : !tabunganData ? (
        <div className="card">
          <EmptyState
            title="Anda Belum Tergabung dalam Kelompok"
            message="Bergabunglah dengan kelompok qurban untuk mulai menabung."
            action={
              <Link to="/jamaah/kelompok" className="btn-primary">
                Lihat Kelompok Qurban
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={BanknotesIcon}
              label="Total Tabungan Terkumpul"
              value={formatRupiah(totalTerkumpul)}
            />
            <StatCard
              icon={CreditCardIcon}
              label="Sisa Tagihan Kelompok"
              value={formatRupiah(sisaTagihan)}
              accent="bg-amber-500"
            />
            <StatCard
              icon={UserGroupIcon}
              label="Kelompok Saya"
              value={namaKelompok ? `Kelompok ${namaKelompok}` : '-'}
              accent="bg-blue-500"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/jamaah/tagihan" className="btn-primary">
              <BanknotesIcon className="h-5 w-5" />
              Lihat Tagihan & Bayar
            </Link>
            <Link to="/jamaah/transaksi" className="btn-secondary">
              <ClipboardDocumentListIcon className="h-5 w-5" />
              Riwayat Transaksi
            </Link>
          </div>
        </>
      )}

      <div className="card mt-8">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold">Transaksi Terakhir</h2>
          <Link to="/jamaah/transaksi" className="text-sm font-medium text-primary-600 hover:underline">
            Lihat Semua
          </Link>
        </div>
        {transaksi.loading ? (
          <LoadingState />
        ) : transaksi.error ? (
          <ErrorState message={transaksi.error} onRetry={transaksi.refetch} />
        ) : transaksiList.length === 0 ? (
          <EmptyState title="Belum Ada Transaksi" message="Transaksi pembayaran Anda akan tampil di sini." />
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {transaksiList.map((trx) => (
              <li key={trx.id_transaksi || trx._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{formatRupiah(trx.total_bayar)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDateTime(trx.tanggal_bayar)} • {trx.metode_bayar || '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(trx.jenis_transaksi)}>{trx.jenis_transaksi || '-'}</Badge>
                  <Badge variant={statusVariant(trx.status_pembayaran)}>
                    {trx.status_pembayaran || '-'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
