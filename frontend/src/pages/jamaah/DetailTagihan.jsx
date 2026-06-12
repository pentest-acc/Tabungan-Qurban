import { Link } from 'react-router-dom';
import {
  BanknotesIcon,
  CreditCardIcon,
  CheckBadgeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import tabunganService from '../../services/tabunganService';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/ui/StatCard';
import { formatRupiah, formatDate } from '../../utils/format';

export default function DetailTagihan() {
  const { data, loading, error, refetch } = useFetch(() => tabunganService.getMine(), []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const tabungan = data?.data ?? data;
  if (!tabungan) {
    return (
      <div>
        <PageHeader title="Detail Tagihan" />
        <div className="card">
          <EmptyState
            title="Belum Ada Tagihan"
            message="Anda belum tergabung dalam kelompok qurban manapun."
            action={
              <Link to="/jamaah/kelompok" className="btn-primary">
                Gabung Kelompok
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const kelompok = tabungan.kelompok ?? {};
  const jumlahAnggota = tabungan.jumlah_anggota ?? 0;
  const kelompokPenuh = tabungan.kelompok_penuh ?? jumlahAnggota >= 7;

  // Tagihan baru aktif setelah kelompok penuh 7 anggota.
  if (!kelompokPenuh) {
    return (
      <div>
        <PageHeader
          title="Detail Tagihan"
          subtitle={`Kelompok ${kelompok.nomor_kelompok || tabungan.nomor_kelompok || '-'}`}
        />
        <div className="card p-8 text-center">
          <UserGroupIcon className="mx-auto h-16 w-16 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold">Tagihan Belum Aktif</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Kelompok Anda baru berisi <strong>{jumlahAnggota}/7 anggota</strong>. Tagihan dan
            pembayaran tabungan qurban akan terbuka otomatis setelah kelompok penuh 7 orang.
          </p>
          <div className="mx-auto mt-5 max-w-xs">
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${Math.round((jumlahAnggota / 7) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">{jumlahAnggota} dari 7 anggota</p>
          </div>
          <Link to="/jamaah/kelompok" className="btn-secondary mt-6">
            Lihat Kelompok Saya
          </Link>
        </div>
      </div>
    );
  }

  const hargaPorsi = tabungan.harga_porsi ?? kelompok.sapi?.harga_porsi ?? 3400000;
  const totalDibayar = tabungan.total_dibayar ?? tabungan.total_terkumpul_pribadi ?? 0;
  const sisaTagihan = tabungan.sisa_tagihan_pribadi ?? Math.max(0, hargaPorsi - totalDibayar);
  const lunas = sisaTagihan <= 0;
  const progress = hargaPorsi > 0 ? Math.min(100, Math.round((totalDibayar / hargaPorsi) * 100)) : 0;

  return (
    <div>
      <PageHeader
        title="Detail Tagihan"
        subtitle={`Kelompok ${kelompok.nomor_kelompok || tabungan.nomor_kelompok || '-'} • Jatuh tempo ${formatDate(kelompok.tanggal_berakhir || tabungan.tanggal_berakhir)}`}
        actions={
          !lunas && (
            <Link to="/jamaah/pembayaran" className="btn-primary">
              <CreditCardIcon className="h-5 w-5" />
              Bayar Sekarang
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={BanknotesIcon} label="Total Tagihan (per porsi)" value={formatRupiah(hargaPorsi)} accent="bg-blue-500" />
        <StatCard icon={CheckBadgeIcon} label="Sudah Dibayar" value={formatRupiah(totalDibayar)} />
        <StatCard
          icon={CreditCardIcon}
          label="Sisa Tagihan"
          value={formatRupiah(sisaTagihan)}
          accent={lunas ? 'bg-primary-600' : 'bg-amber-500'}
        />
      </div>

      <div className="card mt-6 p-6">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium">Progres Pembayaran Anda</span>
          <span className="font-semibold text-primary-600">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {lunas ? (
          <div className="mt-5 flex items-center gap-3 rounded-lg bg-primary-50 p-4 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <CheckBadgeIcon className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-semibold">Alhamdulillah, tagihan Anda sudah lunas!</p>
              <p className="text-sm">Qurban akan dilaksanakan sesuai jadwal kelompok.</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            Selesaikan pembayaran sebesar <strong>{formatRupiah(sisaTagihan)}</strong> sebelum{' '}
            <strong>{formatDate(kelompok.tanggal_berakhir || tabungan.tanggal_berakhir)}</strong> agar
            qurban Anda terlaksana.
          </div>
        )}

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">Total Terkumpul Kelompok</p>
            <p className="mt-1 text-lg font-bold">{formatRupiah(tabungan.total_terkumpul ?? 0)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">Sisa Tagihan Kelompok</p>
            <p className="mt-1 text-lg font-bold">
              {formatRupiah(tabungan.sisa_tagihan_kelompok ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
