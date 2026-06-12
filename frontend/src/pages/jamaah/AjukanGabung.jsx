import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import kelompokService from '../../services/kelompokService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { Textarea } from '../../components/form/Fields';
import Spinner from '../../components/ui/Spinner';

// Jamaah hanya menekan tombol gabung — admin yang menentukan kelompoknya.
export default function AjukanGabung() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error, refetch } = useFetch(() => kelompokService.statusGabung(), []);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await kelompokService.ajukanGabung(values);
      toast.success('Permintaan terkirim! Admin akan menentukan kelompok Anda.');
      navigate('/jamaah/dashboard');
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim permintaan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const menungguPersetujuan = data?.permintaan?.status === 'pending';
  const sudahTergabung = data?.sudah_tergabung;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/jamaah/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>

      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <UserGroupIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gabung Kelompok Qurban</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Admin akan menempatkan Anda di kelompok yang masih tersedia
            </p>
          </div>
        </div>

        {sudahTergabung ? (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-primary-50 p-4 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <CheckCircleIcon className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-semibold">Anda sudah tergabung dalam kelompok!</p>
              <p className="text-sm">
                Lihat tagihan Anda di halaman{' '}
                <Link to="/jamaah/tagihan" className="font-semibold underline">
                  Tagihan Saya
                </Link>
                .
              </p>
            </div>
          </div>
        ) : menungguPersetujuan ? (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-amber-50 p-4 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <ClockIcon className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-semibold">Permintaan Anda sedang menunggu persetujuan</p>
              <p className="text-sm">
                Admin akan menentukan kelompok Anda. Anda akan menerima notifikasi di aplikasi dan
                WhatsApp setelah ditempatkan.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {[
                'Anda tidak perlu memilih kelompok — admin yang menentukan penempatan terbaik.',
                'Satu kelompok berisi maksimal 7 jamaah untuk satu ekor sapi.',
                'Setelah ditempatkan, Anda menerima notifikasi aplikasi dan WhatsApp (jika nomor valid).',
                'Tagihan porsi qurban muncul otomatis setelah Anda resmi menjadi anggota.',
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
                placeholder="Contoh: Saya ingin ikut qurban tahun ini"
                {...register('catatan')}
              />
              <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
                {submitting && <Spinner className="h-4 w-4 text-white" />}
                <UserGroupIcon className="h-5 w-5" />
                Gabung Kelompok Qurban
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
