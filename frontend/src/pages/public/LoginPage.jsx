import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  UserIcon,
  LockClosedIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { PremiumInput } from '../../components/form/PremiumFields';
import Spinner from '../../components/ui/Spinner';
import ThemeToggle from '../../components/layout/ThemeToggle';

const HIGHLIGHTS = [
  'Pantau tabungan qurban Anda secara real-time',
  'Pembayaran instan: Virtual Account, e-wallet & QRIS',
  'Kwitansi digital untuk setiap setoran',
];

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
    <div className="relative flex min-h-screen overflow-hidden">
      {/* ===== Panel kiri: branding (desktop) ===== */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary-700 via-emerald-700 to-teal-800 lg:block">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="animate-blob absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="animate-blob animation-delay-3000 absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex w-fit items-center gap-2.5">
            <img src="/logo-masjid.png" alt="Logo Tabungan Qurban" className="h-11 w-11 object-contain" />
            <span className="text-xl font-bold text-white">Tabungan Qurban</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
              Satu langkah lagi menuju qurban Anda.
            </h1>
            <ul className="mt-8 space-y-4">
              {HIGHLIGHTS.map((item, idx) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.15 }}
                  className="flex items-center gap-3 text-primary-50/95"
                >
                  <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-300" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <p className="text-sm text-primary-100/70">
            &copy; {new Date().getFullYear()} Sistem Tabungan Qurban
          </p>
        </div>
      </div>

      {/* ===== Panel kanan: form ===== */}
      <div className="relative flex w-full items-center justify-center p-4 sm:p-8 lg:w-1/2">
        {/* Latar lembut untuk mobile/kanan */}
        <div className="bg-grid bg-grid-fade absolute inset-0 -z-10" />
        <div className="animate-blob absolute -top-20 right-0 -z-10 h-72 w-72 rounded-full bg-primary-300/25 blur-3xl dark:bg-primary-600/15" />
        <div className="animate-blob animation-delay-3000 absolute bottom-0 -left-20 -z-10 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl dark:bg-teal-500/15" />

        <div className="absolute right-4 top-4 flex items-center gap-1">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Beranda
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="glass w-full max-w-md rounded-3xl p-8 sm:p-10"
        >
          <Link to="/" className="mb-7 flex items-center justify-center lg:hidden">
            <img src="/logo-masjid.png" alt="Logo Tabungan Qurban" className="h-16 w-16 object-contain" />
          </Link>

          <h2 className="text-center text-3xl font-extrabold tracking-tight">
            Selamat Datang <span className="text-gradient">Kembali</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Masuk untuk melanjutkan tabungan qurban Anda
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <PremiumInput
              label="Username"
              icon={UserIcon}
              placeholder="Masukkan username"
              autoComplete="username"
              error={errors.username}
              {...register('username', { required: 'Username wajib diisi' })}
            />
            <PremiumInput
              label="Password"
              icon={LockClosedIcon}
              type="password"
              placeholder="Masukkan password"
              autoComplete="current-password"
              error={errors.password}
              {...register('password', { required: 'Password wajib diisi' })}
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-emerald-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary-600/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Spinner className="h-5 w-5 text-white" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Baru di sini?
            </span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <Link
            to="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 py-3 text-sm font-semibold text-slate-700 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-primary-700 dark:hover:text-primary-400"
          >
            Daftar sebagai Jamaah
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
