import { Link, useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import useFetch from '../../hooks/useFetch';
import paymentService from '../../services/paymentService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { formatRupiah, formatDateTime } from '../../utils/format';

const TAMPILAN = {
  success: {
    icon: CheckCircleIcon,
    warna: 'text-primary-600',
    judul: 'Pembayaran Berhasil!',
    pesan: 'Alhamdulillah, setoran Anda sudah tercatat dan saldo tabungan kelompok telah diperbarui.',
  },
  failed: {
    icon: XCircleIcon,
    warna: 'text-red-500',
    judul: 'Pembayaran Gagal',
    pesan: 'Pembayaran dibatalkan atau melewati batas waktu. Silakan coba lagi dari halaman tagihan.',
  },
  pending: {
    icon: ClockIcon,
    warna: 'text-amber-500',
    judul: 'Menunggu Pembayaran',
    pesan: 'Pembayaran Anda belum kami terima. Selesaikan pembayaran sesuai instruksi.',
  },
};

export default function HasilPembayaran() {
  const { ref } = useParams();
  const { data, loading, error, refetch } = useFetch(() => paymentService.getStatus(ref), [ref]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const tampil = TAMPILAN[data.status_pembayaran] || TAMPILAN.pending;

  return (
    <div className="mx-auto max-w-lg">
      <div className="card p-8 text-center">
        <tampil.icon className={`mx-auto h-20 w-20 ${tampil.warna}`} />
        <h1 className="mt-4 text-2xl font-bold">{tampil.judul}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{tampil.pesan}</p>

        <dl className="mt-6 space-y-2 rounded-lg bg-slate-50 p-4 text-left text-sm dark:bg-slate-800/60">
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">No. Referensi</dt>
            <dd className="font-mono text-xs">{data.nomor_referensi}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Nominal</dt>
            <dd className="font-bold">{formatRupiah(data.total_bayar)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Metode</dt>
            <dd>{data.metode_bayar}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Waktu</dt>
            <dd>{formatDateTime(data.tanggal_bayar)}</dd>
          </div>
          {data.status_pembayaran === 'success' && (
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Bukti</dt>
              <dd>
                <Link
                  to={`/jamaah/transaksi/kwitansi/${data.nomor_referensi}`}
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  Lihat Kwitansi
                </Link>
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {data.status_pembayaran === 'pending' ? (
            <Link to={`/jamaah/pembayaran/instruksi/${ref}`} className="btn-primary flex-1">
              Lanjutkan Pembayaran
            </Link>
          ) : data.status_pembayaran === 'failed' ? (
            <Link to="/jamaah/pembayaran" className="btn-primary flex-1">
              Coba Bayar Lagi
            </Link>
          ) : (
            <Link to="/jamaah/tagihan" className="btn-primary flex-1">
              Lihat Tagihan Saya
            </Link>
          )}
          <Link to="/jamaah/transaksi" className="btn-secondary flex-1">
            Riwayat Transaksi
          </Link>
        </div>
      </div>
    </div>
  );
}
