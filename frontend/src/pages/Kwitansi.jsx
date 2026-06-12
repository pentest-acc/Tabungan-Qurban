import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import useFetch from '../hooks/useFetch';
import paymentService from '../services/paymentService';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import Badge, { statusVariant } from '../components/ui/Badge';
import { formatRupiah, formatDateTime } from '../utils/format';

// Kwitansi / bukti pembayaran internal — dipakai jamaah maupun admin.
export default function Kwitansi() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(() => paymentService.getReceipt(ref), [ref]);

  if (loading) return <LoadingState message="Memuat kwitansi..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const lunas = data.status_pembayaran === 'success';

  return (
    <div className="mx-auto max-w-2xl">
      {/* Saat dicetak: sembunyikan sidebar, navbar, dan tombol aksi */}
      <style>{`@media print { aside, header, .no-print { display: none !important; } main { padding: 0 !important; } }`}</style>

      <div className="no-print mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          <PrinterIcon className="h-5 w-5" />
          Cetak / Simpan PDF
        </button>
      </div>

      <div className="card relative overflow-hidden p-8">
        {/* Stempel status */}
        {lunas && (
          <div className="pointer-events-none absolute right-6 top-6 rotate-12 rounded-lg border-4 border-primary-600/60 px-4 py-1 text-2xl font-extrabold uppercase tracking-widest text-primary-600/60">
            Lunas
          </div>
        )}

        <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
          <img src="/logo-masjid.png" alt="Logo Tabungan Qurban" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl font-bold">Kwitansi Pembayaran</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sistem Tabungan Qurban</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          {[
            ['No. Referensi', <span className="font-mono">{data.nomor_referensi}</span>],
            ['ID Transaksi', <span className="font-mono">{data.id_transaksi}</span>],
            ['Diterima dari', <strong>{data.nama_jamaah}</strong>],
            ['Kelompok Qurban', `Kelompok ${data.nomor_kelompok}`],
            ['Tanggal Pembayaran', formatDateTime(data.tanggal_bayar)],
            ['Metode Pembayaran', data.metode_bayar],
            ['Jenis Pembayaran', data.jenis_transaksi],
            [
              'Status',
              <Badge variant={statusVariant(data.status_pembayaran)}>{data.status_pembayaran}</Badge>,
            ],
          ].map(([label, nilai]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="text-right">{nilai}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-center justify-between rounded-lg bg-primary-50 p-4 dark:bg-primary-900/30">
          <span className="font-semibold text-primary-700 dark:text-primary-300">Jumlah Dibayar</span>
          <span className="text-2xl font-extrabold text-primary-700 dark:text-primary-300">
            {formatRupiah(data.total_bayar)}
          </span>
        </div>

        {lunas && (
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <CheckBadgeIcon className="h-4 w-4 text-primary-600" />
            Dokumen ini diterbitkan otomatis oleh sistem dan sah tanpa tanda tangan.
          </p>
        )}
      </div>
    </div>
  );
}
