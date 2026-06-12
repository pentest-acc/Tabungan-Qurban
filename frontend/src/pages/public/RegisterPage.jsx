import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Input, Textarea } from '../../components/form/Fields';
import Spinner from '../../components/ui/Spinner';
import ThemeToggle from '../../components/layout/ThemeToggle';

export default function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { konfirmasi_password, ...payload } = values;
      await registerAccount(payload);
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registrasi gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="card w-full max-w-lg p-8">
        <h1 className="text-center text-2xl font-bold">Daftar Akun Jamaah</h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Lengkapi data diri Anda untuk mulai menabung qurban
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Ahmad Fauzi"
            error={errors.nama_lengkap}
            {...register('nama_lengkap', { required: 'Nama lengkap wajib diisi' })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Username"
              placeholder="Username unik"
              autoComplete="username"
              error={errors.username}
              {...register('username', {
                required: 'Username wajib diisi',
                minLength: { value: 4, message: 'Minimal 4 karakter' },
              })}
            />
            <Input
              label="No. Telepon"
              type="tel"
              placeholder="08xxxxxxxxxx"
              error={errors.no_telp}
              {...register('no_telp', {
                required: 'No. telepon wajib diisi',
                pattern: { value: /^[0-9+\-\s]{8,16}$/, message: 'Format nomor tidak valid' },
              })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              error={errors.password}
              {...register('password', {
                required: 'Password wajib diisi',
                minLength: { value: 6, message: 'Minimal 6 karakter' },
              })}
            />
            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              autoComplete="new-password"
              error={errors.konfirmasi_password}
              {...register('konfirmasi_password', {
                required: 'Konfirmasi password wajib diisi',
                validate: (v) => v === watch('password') || 'Password tidak sama',
              })}
            />
          </div>
          <Textarea
            label="Alamat (opsional)"
            placeholder="Alamat tempat tinggal"
            error={errors.alamat}
            {...register('alamat')}
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Spinner className="h-4 w-4 text-white" />}
            Buat Akun
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
