import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  AtSymbolIcon,
  PhoneIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { PremiumInput, PremiumTextarea } from '../../components/form/PremiumFields';
import Spinner from '../../components/ui/Spinner';
import ThemeToggle from '../../components/layout/ThemeToggle';

// Wizard 2 langkah secara VISUAL saja — tetap satu form react-hook-form
// dengan field dan logika submit yang sama persis seperti sebelumnya.
const LANGKAH = [
  { judul: 'Data Diri', deskripsi: 'Identitas & kontak Anda' },
  { judul: 'Keamanan', deskripsi: 'Buat password akun' },
];
const FIELD_LANGKAH_1 = ['nama_lengkap', 'username', 'no_telp', 'alamat'];

// Indikator kekuatan password (visual saja, tidak mengubah aturan validasi)
function kekuatanPassword(password = '') {
  let skor = 0;
  if (password.length >= 6) skor += 1;
  if (password.length >= 10) skor += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) skor += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) skor += 1;
  return skor; // 0-4
}
const LABEL_KEKUATAN = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
const WARNA_KEKUATAN = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-primary-600'];

export default function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [arah, setArah] = useState(1); // arah animasi slide
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const password = watch('password') || '';
  const skor = kekuatanPassword(password);

  const keLangkahDua = async () => {
    const valid = await trigger(FIELD_LANGKAH_1);
    if (valid) {
      setArah(1);
      setStep(1);
    }
  };

  const kembali = () => {
    setArah(-1);
    setStep(0);
  };

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

  const slide = {
    enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0, transition: { duration: 0.25 } }),
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8">
      {/* Latar */}
      <div className="bg-grid bg-grid-fade absolute inset-0 -z-10" />
      <div className="animate-blob absolute -top-24 left-1/4 -z-10 h-80 w-80 rounded-full bg-primary-300/25 blur-3xl dark:bg-primary-600/15" />
      <div className="animate-blob animation-delay-3000 absolute bottom-0 right-1/5 -z-10 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl dark:bg-teal-500/15" />

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
        className="glass w-full max-w-lg rounded-3xl p-8 sm:p-10"
      >
        <Link to="/" className="mb-6 flex items-center justify-center">
          <img src="/logo-masjid.png" alt="Logo Tabungan Qurban" className="h-14 w-14 object-contain" />
        </Link>

        <h1 className="text-center text-3xl font-extrabold tracking-tight">
          Daftar <span className="text-gradient">Akun Jamaah</span>
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          Gratis selamanya — mulai menabung qurban hari ini
        </p>

        {/* Indikator langkah */}
        <div className="mt-7 flex items-center gap-3">
          {LANGKAH.map((item, idx) => (
            <div key={item.judul} className="flex flex-1 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  idx < step
                    ? 'bg-primary-600 text-white'
                    : idx === step
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/40 ring-4 ring-primary-500/20'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {idx < step ? <CheckCircleIcon className="h-5 w-5" /> : idx + 1}
              </div>
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${idx <= step ? '' : 'text-slate-400'}`}>
                  {item.judul}
                </p>
                <p className="truncate text-xs text-slate-400">{item.deskripsi}</p>
              </div>
              {idx < LANGKAH.length - 1 && (
                <div className="relative mx-1 hidden h-1 flex-1 overflow-hidden rounded-full bg-slate-200 sm:block dark:bg-slate-800">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary-600"
                    animate={{ width: step > idx ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7" noValidate>
          <AnimatePresence mode="wait" custom={arah}>
            {step === 0 ? (
              <motion.div
                key="langkah-1"
                custom={arah}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <PremiumInput
                  label="Nama Lengkap"
                  icon={UserIcon}
                  placeholder="Contoh: Ahmad Fauzi"
                  error={errors.nama_lengkap}
                  {...register('nama_lengkap', { required: 'Nama lengkap wajib diisi' })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <PremiumInput
                    label="Username"
                    icon={AtSymbolIcon}
                    placeholder="Username unik"
                    autoComplete="username"
                    error={errors.username}
                    {...register('username', {
                      required: 'Username wajib diisi',
                      minLength: { value: 4, message: 'Minimal 4 karakter' },
                    })}
                  />
                  <PremiumInput
                    label="No. Telepon"
                    icon={PhoneIcon}
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    error={errors.no_telp}
                    {...register('no_telp', {
                      required: 'No. telepon wajib diisi',
                      pattern: { value: /^[0-9+\-\s]{8,16}$/, message: 'Format nomor tidak valid' },
                    })}
                  />
                </div>
                <PremiumTextarea
                  label="Alamat (opsional)"
                  placeholder="Alamat tempat tinggal"
                  error={errors.alamat}
                  {...register('alamat')}
                />

                <motion.button
                  type="button"
                  onClick={keLangkahDua}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary-600/40"
                >
                  Lanjut ke Keamanan
                  <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="langkah-2"
                custom={arah}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div>
                  <PremiumInput
                    label="Password"
                    icon={LockClosedIcon}
                    type="password"
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    error={errors.password}
                    {...register('password', {
                      required: 'Password wajib diisi',
                      minLength: { value: 6, message: 'Minimal 6 karakter' },
                    })}
                  />
                  {/* Meter kekuatan password — indikator visual */}
                  {password && (
                    <div className="mt-2.5">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((tingkat) => (
                          <motion.span
                            key={tingkat}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            className={`h-1.5 flex-1 origin-left rounded-full transition-colors duration-300 ${
                              skor >= tingkat ? WARNA_KEKUATAN[skor] : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Kekuatan: <span className="font-bold">{LABEL_KEKUATAN[skor]}</span>
                      </p>
                    </div>
                  )}
                </div>
                <PremiumInput
                  label="Konfirmasi Password"
                  icon={ShieldCheckIcon}
                  type="password"
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  error={errors.konfirmasi_password}
                  {...register('konfirmasi_password', {
                    required: 'Konfirmasi password wajib diisi',
                    validate: (v) => v === watch('password') || 'Password tidak sama',
                  })}
                />

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={kembali}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-5 py-3.5 text-sm font-semibold text-slate-600 backdrop-blur transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Kembali
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.015 }}
                    whileTap={{ scale: loading ? 1 : 0.985 }}
                    className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary-600/40 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Spinner className="h-5 w-5 text-white" />
                        Membuat Akun...
                      </>
                    ) : (
                      <>
                        Buat Akun
                        <CheckCircleIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary-600 transition-colors hover:text-primary-700 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
