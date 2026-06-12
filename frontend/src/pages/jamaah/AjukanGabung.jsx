import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import kelompokService from '../../services/kelompokService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { Textarea } from '../../components/form/Fields';
import Spinner from '../../components/ui/Spinner';
import { formatRupiah, formatDate } from '../../utils/format';

export default function AjukanGabung() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error, refetch } = useFetch(() => kelompokService.getById(id), [id]);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await kelompokService.ajukanGabung(id, values);
      toast.success('Permintaan bergabung terkirim. Menunggu persetujuan admin.');
      navigate('/jamaah/kelompok');
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim permintaan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const kelompok = data?.data ?? data ?? {};
  const sapi = kelompok.sapi ?? {};

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={`/jamaah/kelompok/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke Detail Kelompok
      </Link>

      <div className="card p-6">
        <h1 className="text-2xl font-bold">Ajukan Bergabung</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Permintaan Anda akan diverifikasi oleh admin sebelum resmi menjadi anggota.
        </p>

        <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
          <p className="font-semibold">
            Kelompok {kelompok.nomor_kelompok || kelompok.id_kelompok}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Periode {formatDate(kelompok.tanggal_mulai)} — {formatDate(kelompok.tanggal_berakhir)}
          </p>
          <p className="mt-1 font-semibold text-primary-600">
            Tagihan per porsi: {formatRupiah(sapi.harga_porsi ?? kelompok.harga_porsi ?? 3400000)}
          </p>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {[
            'Satu kelompok maksimal berisi 7 jamaah untuk satu ekor sapi.',
            'Setelah diterima, tagihan porsi qurban akan muncul di halaman Tagihan.',
            'Pembayaran dapat dilakukan tunai sekaligus atau dicicil hingga periode berakhir.',
          ].map((info) => (
            <li key={info} className="flex items-start gap-2">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
              {info}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Textarea
            label="Catatan untuk Admin (opsional)"
            placeholder="Contoh: Saya ingin bergabung untuk qurban tahun ini"
            {...register('catatan')}
          />
          <div className="flex justify-end gap-2">
            <Link to={`/jamaah/kelompok/${id}`} className="btn-secondary">
              Batal
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Spinner className="h-4 w-4 text-white" />}
              Kirim Permintaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
