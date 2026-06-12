import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/form/Fields';
import Spinner from '../../components/ui/Spinner';
import ThemeToggle from '../../components/layout/ThemeToggle';

export default function LoginPage() {
  const { login, homePathFor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const user = await login(values);
      toast.success(`Selamat datang, ${user.nama_lengkap || user.username}!`);
      const redirectTo = location.state?.from?.pathname || homePathFor(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="card w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src="/logo-masjid.png" alt="Logo Tabungan Qurban" className="h-16 w-16 object-contain" />
        </Link>
        <h1 className="text-center text-2xl font-bold">Masuk ke Akun Anda</h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Sistem Tabungan Qurban
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Input
            label="Username"
            placeholder="Masukkan username"
            autoComplete="username"
            error={errors.username}
            {...register('username', { required: 'Username wajib diisi' })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            error={errors.password}
            {...register('password', { required: 'Password wajib diisi' })}
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Spinner className="h-4 w-4 text-white" />}
            Masuk
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Daftar sebagai Jamaah
          </Link>
        </p>
      </div>
    </div>
  );
}
