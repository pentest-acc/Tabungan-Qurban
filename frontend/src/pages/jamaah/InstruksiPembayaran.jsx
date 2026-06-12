import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import paymentService from '../../services/paymentService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatRupiah } from '../../utils/format';

function SisaWaktu({ kadaluarsa }) {
  const [sisa, setSisa] = useState('');
  useEffect(() => {
    const hitung = () => {
      const ms = new Date(kadaluarsa) - new Date();
      if (ms <= 0) return setSisa('Waktu habis');
      const menit = Math.floor(ms / 60000);
      const detik = Math.floor((ms % 60000) / 1000);
      setSisa(`${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`);
    };
    hitung();
    const id = setInterval(hitung, 1000);
    return () => clearInterval(id);
  }, [kadaluarsa]);
  return <span className="font-mono font-bold">{sisa}</span>;
}

export default function InstruksiPembayaran() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const [simulating, setSimulating] = useState(false);
  const { data, loading, error, refetch } = useFetch(() => paymentService.getStatus(ref), [ref]);

  // Polling status tiap 5 detik selama masih pending — webhook bisa datang kapan saja.
  useEffect(() => {
    if (!data || data.status_pembayaran !== 'pending') return undefined;
    const id = setInterval(refetch, 5000);
    return () => clearInterval(id);
  }, [data, refetch]);

  // Selesai (success/failed) → arahkan ke halaman hasil.
  useEffect(() => {
    if (data && data.status_pembayaran !== 'pending') {
      navigate(`/jamaah/pembayaran/hasil/${ref}`, { replace: true });
    }
  }, [data, navigate, ref]);

  if (loading) return <LoadingState message="Memuat instruksi pembayaran..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const salinKode = async () => {
    try {
      await navigator.clipboard.writeText(data.kode_bayar);
      toast.success('Kode pembayaran disalin');
    } catch {
      toast.error('Gagal menyalin, salin manual');
    }
  };

  const simulasi = async (hasil) => {
    setSimulating(true);
    try {
      await paymentService.simulate(ref, hasil);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Simulasi gagal');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/jamaah/tagihan"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke Tagihan
      </Link>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Selesaikan Pembayaran</h1>
          <Badge variant={statusVariant(data.status_pembayaran)}>{data.status_pembayaran}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ref: <span className="font-mono">{data.nomor_referensi}</span>
        </p>

        <div className="mt-5 flex items-center justify-between rounded-lg bg-amber-50 p-4 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <span className="flex items-center gap-2 text-sm">
            <ClockIcon className="h-5 w-5" />
            Bayar sebelum waktu habis
          </span>
          <SisaWaktu kadaluarsa={data.kadaluarsa} />
        </div>

        <div className="mt-5 rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total yang harus dibayar</p>
          <p className="text-3xl font-extrabold text-primary-600">{formatRupiah(data.total_bayar)}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">via {data.metode_bayar}</p>
        </div>

        {/* Kode bayar / QR */}
        {data.metode_bayar === 'QRIS' ? (
          <div className="mt-5 flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 p-6 dark:border-slate-700">
            <QrCodeIcon className="h-32 w-32 text-slate-700 dark:text-slate-300" />
            <p className="break-all text-center font-mono text-xs text-slate-500 dark:text-slate-400">
              {data.kode_bayar}
            </p>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {data.metode_bayar === 'Transfer Bank' ? 'Nomor Virtual Account' : 'Kode Pembayaran'}
              </p>
              <p className="font-mono text-xl font-bold tracking-wider">{data.kode_bayar}</p>
            </div>
            <button onClick={salinKode} className="btn-secondary !px-3" title="Salin kode">
              <ClipboardDocumentIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Instruksi */}
        <ol className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {(data.instruksi || []).map((langkah, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                {idx + 1}
              </span>
              {langkah}
            </li>
          ))}
        </ol>

        <p className="mt-5 flex items-center gap-2 text-xs text-slate-400">
          <Spinner className="h-3.5 w-3.5" />
          Status diperbarui otomatis setelah pembayaran diterima...
        </p>

        {/* Simulator sandbox — pengganti aplikasi bank saat demo/pengembangan */}
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Mode Sandbox — simulasikan respons payment gateway
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => simulasi('success')}
              className="btn-primary flex-1"
              disabled={simulating}
            >
              {simulating && <Spinner className="h-4 w-4 text-white" />}
              Simulasikan Berhasil
            </button>
            <button
              onClick={() => simulasi('failed')}
              className="btn-danger flex-1"
              disabled={simulating}
            >
              Simulasikan Gagal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
