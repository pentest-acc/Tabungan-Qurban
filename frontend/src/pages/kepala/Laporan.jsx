import { PrinterIcon, BanknotesIcon, UserGroupIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import laporanService from '../../services/laporanService';
import jamaahService from '../../services/jamaahService';
import kelompokService from '../../services/kelompokService';
import transaksiService from '../../services/transaksiService';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/ui/StatCard';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatRupiah, formatDate } from '../../utils/format';

const asList = (r) => (r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : r.value?.data ?? []) : []);

export default function Laporan() {
  const { data, loading, error, refetch } = useFetch(async () => {
    // Coba endpoint laporan; fallback ke agregasi sisi klien dari data mentah.
    try {
      const [ringkasan, perKelompok] = await Promise.all([
        laporanService.getRingkasan(),
        laporanService.getPerKelompok(),
      ]);
      return {
        ringkasan: ringkasan?.data ?? ringkasan,
        kelompok: perKelompok?.data ?? perKelompok ?? [],
      };
    } catch {
      const [jamaah, kelompok, transaksi] = await Promise.allSettled([
        jamaahService.getAll(),
        kelompokService.getAll(),
        transaksiService.getAll(),
      ]);
      const kelompokList = asList(kelompok);
      const transaksiList = asList(transaksi);
      return {
        ringkasan: {
          total_jamaah: asList(jamaah).length,
          total_kelompok: kelompokList.length,
          total_transaksi: transaksiList.length,
          total_dana: transaksiList.reduce((sum, t) => sum + (Number(t.total_bayar) || 0), 0),
        },
        kelompok: kelompokList,
      };
    }
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const ringkasan = data?.ringkasan ?? {};
  const kelompokList = data?.kelompok ?? [];

  return (
    <div>
      <PageHeader
        title="Laporan Keseluruhan"
        subtitle={`Ringkasan sistem tabungan qurban per ${formatDate(new Date())}`}
        actions={
          <button onClick={() => window.print()} className="btn-secondary">
            <PrinterIcon className="h-5 w-5" />
            Cetak Laporan
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BanknotesIcon} label="Total Dana Terkumpul" value={formatRupiah(ringkasan.total_dana ?? 0)} />
        <StatCard icon={UsersIcon} label="Total Jamaah" value={ringkasan.total_jamaah ?? 0} accent="bg-blue-500" />
        <StatCard icon={UserGroupIcon} label="Total Kelompok" value={ringkasan.total_kelompok ?? 0} accent="bg-amber-500" />
        <StatCard icon={ChartBarIcon} label="Total Transaksi" value={ringkasan.total_transaksi ?? 0} accent="bg-teal-500" />
      </div>

      <div className="card mt-6">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold">Progres per Kelompok</h2>
        </div>
        {kelompokList.length === 0 ? (
          <EmptyState title="Belum Ada Kelompok" message="Data kelompok akan tampil di sini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="table-th">Kelompok</th>
                  <th className="table-th">Periode</th>
                  <th className="table-th">Anggota</th>
                  <th className="table-th">Terkumpul</th>
                  <th className="table-th">Sisa Tagihan</th>
                  <th className="table-th">Progres</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {kelompokList.map((kelompok) => {
                  const terkumpul =
                    kelompok.tabungan?.total_terkumpul ?? kelompok.total_terkumpul ?? 0;
                  const target = kelompok.sapi?.harga_sapi ?? kelompok.harga_sapi ?? 23800000;
                  const sisa =
                    kelompok.tabungan?.sisa_tagihan_kelompok ??
                    kelompok.sisa_tagihan_kelompok ??
                    Math.max(0, target - terkumpul);
                  const progress = target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : 0;
                  return (
                    <tr key={kelompok.id_kelompok || kelompok._id}>
                      <td className="table-td font-medium">
                        Kelompok {kelompok.nomor_kelompok || kelompok.id_kelompok}
                      </td>
                      <td className="table-td">
                        {formatDate(kelompok.tanggal_mulai)} — {formatDate(kelompok.tanggal_berakhir)}
                      </td>
                      <td className="table-td">
                        {kelompok.jumlah_anggota ?? kelompok.anggota?.length ?? 0}/7
                      </td>
                      <td className="table-td font-semibold">{formatRupiah(terkumpul)}</td>
                      <td className="table-td">{formatRupiah(sisa)}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div className="h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{progress}%</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <Badge variant={statusVariant(kelompok.status)}>{kelompok.status || '-'}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
