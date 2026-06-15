import {
  PrinterIcon,
  BanknotesIcon,
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
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

// CSS khusus cetak: sembunyikan sidebar/navbar & tombol, tampilkan kop laporan,
// jaga agar kartu tiap kelompok tidak terpotong antar-halaman, dan paksa warna.
const PRINT_CSS = `
@media print {
  aside, header, .no-print { display: none !important; }
  main { padding: 0 !important; }
  .print-only { display: block !important; }
  .laporan-card { break-inside: avoid; box-shadow: none !important; border-color: #cbd5e1 !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
.print-only { display: none; }
`;

function Bar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${value >= 100 ? 'bg-emerald-500' : 'bg-primary-600'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums">{value}%</span>
    </div>
  );
}

function KartuKelompok({ kelompok }) {
  const terkumpul = kelompok.tabungan?.total_terkumpul ?? kelompok.total_terkumpul ?? 0;
  const target = kelompok.sapi?.harga_sapi ?? kelompok.harga_sapi ?? 23800000;
  const sisa =
    kelompok.tabungan?.sisa_tagihan_kelompok ??
    kelompok.sisa_tagihan_kelompok ??
    Math.max(0, target - terkumpul);
  const progress = target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : 0;
  const jumlahAnggota = kelompok.jumlah_anggota ?? kelompok.anggota?.length ?? 0;
  const anggota = kelompok.anggota ?? [];

  return (
    <div className="card laporan-card mt-4 p-5">
      {/* Kepala kartu */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold">
              Kelompok {kelompok.nomor_kelompok || kelompok.id_kelompok}
            </h3>
            <Badge variant={statusVariant(kelompok.status)}>{kelompok.status || '-'}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Periode {formatDate(kelompok.tanggal_mulai)} — {formatDate(kelompok.tanggal_berakhir)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Anggota</p>
          <p className="text-lg font-bold tabular-nums">{jumlahAnggota}/7</p>
        </div>
      </div>

      {/* Ringkasan kelompok */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">Terkumpul</p>
          <p className="text-sm font-bold text-primary-700 dark:text-primary-300">{formatRupiah(terkumpul)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">Sisa Tagihan</p>
          <p className="text-sm font-bold">{formatRupiah(sisa)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">Progres Kelompok</p>
          <div className="mt-1">
            <Bar value={progress} />
          </div>
        </div>
      </div>

      {/* Rincian progres per anggota */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Progres Pembayaran Anggota
        </p>
        {anggota.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-slate-700">
            Belum ada anggota pada kelompok ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="table-th">Nama Anggota</th>
                  <th className="table-th">Dibayar</th>
                  <th className="table-th">Sisa</th>
                  <th className="table-th">Progres</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {anggota.map((a) => (
                  <tr key={a.id_jamaah}>
                    <td className="table-td font-medium">
                      {a.nama_lengkap}
                      <span className="ml-1 text-xs text-slate-400">@{a.username}</span>
                    </td>
                    <td className="table-td font-semibold">{formatRupiah(a.total_dibayar)}</td>
                    <td className="table-td">{formatRupiah(a.sisa_tagihan_pribadi)}</td>
                    <td className="table-td">
                      <Bar value={a.progres ?? 0} />
                    </td>
                    <td className="table-td">
                      {a.lunas ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircleIcon className="h-3.5 w-3.5" /> Lunas
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          Menyicil
                        </span>
                      )}
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
      <style>{PRINT_CSS}</style>

      {/* Kop laporan — hanya muncul saat dicetak */}
      <div className="print-only mb-4 border-b-2 border-slate-300 pb-3">
        <h1 className="text-xl font-bold">Laporan Keseluruhan — Sistem Tabungan Qurban</h1>
        <p className="text-sm text-slate-600">Masjid Jami Nurul Hikmah · Dicetak {formatDate(new Date())}</p>
      </div>

      <PageHeader
        title="Laporan Keseluruhan"
        subtitle={`Ringkasan sistem tabungan qurban per ${formatDate(new Date())}`}
        actions={
          <button onClick={() => window.print()} className="btn-secondary no-print">
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

      <div className="mt-6">
        <h2 className="font-semibold">Progres per Kelompok & Anggota</h2>
        {kelompokList.length === 0 ? (
          <div className="card mt-4">
            <EmptyState title="Belum Ada Kelompok" message="Data kelompok akan tampil di sini." />
          </div>
        ) : (
          kelompokList.map((kelompok) => (
            <KartuKelompok key={kelompok.id_kelompok || kelompok._id} kelompok={kelompok} />
          ))
        )}
      </div>
    </div>
  );
}
