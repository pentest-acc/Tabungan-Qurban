import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import tabunganService from '../../services/tabunganService';
import paymentService from '../../services/paymentService';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatRupiah } from '../../utils/format';

const METODE_BAYAR = [
  { value: 'Transfer Bank', label: 'Transfer Bank', icon: BuildingLibraryIcon, hint: 'BCA, BRI, Mandiri, BNI' },
  { value: 'E-Wallet', label: 'E-Wallet', icon: DevicePhoneMobileIcon, hint: 'GoPay, OVO, Dana, ShopeePay' },
  { value: 'QRIS', label: 'QRIS', icon: QrCodeIcon, hint: 'Scan QR dari aplikasi apapun' },
];

export default function Pembayaran() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error, refetch } = useFetch(() => tabunganService.getMine(), []);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { jenis_transaksi: 'cicil', metode_bayar: 'Transfer Bank' } });

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const tabungan = data?.data ?? data;
  if (!tabungan) {
    return (
      <div className="card">
        <EmptyState
          title="Tidak Ada Tagihan"
          message="Anda belum tergabung dalam kelompok, sehingga belum ada tagihan untuk dibayar."
          action={
            <Link to="/jamaah/kelompok" className="btn-primary">
              Gabung Kelompok
            </Link>
          }
        />
      </div>
    );
  }

  const hargaPorsi = tabungan.harga_porsi ?? tabungan.kelompok?.sapi?.harga_porsi ?? 3400000;
  const totalDibayar = tabungan.total_dibayar ?? tabungan.total_terkumpul_pribadi ?? 0;
  const sisaTagihan = tabungan.sisa_tagihan_pribadi ?? Math.max(0, hargaPorsi - totalDibayar);
  const jenis = watch('jenis_transaksi');
  const metode = watch('metode_bayar');

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Buat checkout di payment gateway lalu arahkan ke halaman instruksi.
      const pembayaran = await paymentService.checkout({
        id_tabungan: tabungan.id_tabungan || tabungan._id,
        total_bayar: Number(values.total_bayar),
        metode_bayar: values.metode_bayar,
        jenis_transaksi: values.jenis_transaksi,
      });
      navigate(`/jamaah/pembayaran/instruksi/${pembayaran.nomor_referensi}`);
    } catch (err) {
      toast.error(err.message || 'Gagal membuat pembayaran, silakan coba lagi');
    } finally {
      setSubmitting(false);
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
      <PageHeader title="Pembayaran Tabungan" subtitle="Setor dana qurban melalui payment gateway" />

      <div className="card p-6">
        <div className="rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Sisa tagihan Anda</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{formatRupiah(sisaTagihan)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          {/* Jenis transaksi */}
          <div>
            <label className="label">Jenis Pembayaran</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'tunai', label: 'Tunai (Lunas)', desc: `Bayar penuh ${formatRupiah(sisaTagihan)}` },
                { value: 'cicil', label: 'Cicil', desc: 'Bayar sebagian sesuai kemampuan' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    setValue('jenis_transaksi', opt.value);
                    if (opt.value === 'tunai') setValue('total_bayar', sisaTagihan);
                  }}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    jenis === opt.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-slate-300 hover:border-primary-400 dark:border-slate-700'
                  }`}
                >
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>
            <input type="hidden" {...register('jenis_transaksi')} />
          </div>

          {/* Nominal */}
          <div>
            <label className="label">Nominal Setoran (Rp)</label>
            <input
              type="number"
              className="input"
              placeholder="Contoh: 500000"
              readOnly={jenis === 'tunai'}
              {...register('total_bayar', {
                required: 'Nominal wajib diisi',
                min: { value: 10000, message: 'Minimal setoran Rp 10.000' },
                max: { value: sisaTagihan, message: `Maksimal ${formatRupiah(sisaTagihan)}` },
              })}
            />
            {errors.total_bayar && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.total_bayar.message}</p>
            )}
          </div>

          {/* Metode */}
          <div>
            <label className="label">Metode Pembayaran</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {METODE_BAYAR.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setValue('metode_bayar', opt.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center text-sm transition-colors ${
                    metode === opt.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-slate-300 hover:border-primary-400 dark:border-slate-700'
                  }`}
                >
                  <opt.icon className="h-6 w-6 text-primary-600" />
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{opt.hint}</span>
                </button>
              ))}
            </div>
            <input type="hidden" {...register('metode_bayar')} />
          </div>

          <button type="submit" className="btn-primary w-full !py-3" disabled={submitting || sisaTagihan <= 0}>
            {submitting && <Spinner className="h-4 w-4 text-white" />}
            {sisaTagihan <= 0 ? 'Tagihan Sudah Lunas' : 'Bayar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
