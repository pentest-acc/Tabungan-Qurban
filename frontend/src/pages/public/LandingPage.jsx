import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import {
  UserGroupIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  BellAlertIcon,
  DocumentCheckIcon,
  LockClosedIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import PublicNavbar from '../../components/layout/PublicNavbar';
import LaporDeveloper from '../../components/feedback/LaporDeveloper';
import { formatRupiah } from '../../utils/format';

// Identitas & lokasi masjid penyelenggara.
const MASJID = {
  nama: 'Masjid Jami Nurul Hikmah',
  alamat:
    'Jl. Damai Raya No.22, RT.003/RW.020, Harapan Jaya, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat 17124',
};
const MAP_QUERY = encodeURIComponent(`${MASJID.nama}, ${MASJID.alamat}`);
const MAP_EMBED = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

/* ====== Animasi bersama ====== */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function Reveal({ children, className = '', variants = fadeUp }) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}

/* Angka yang menghitung naik saat terlihat di layar */
function CountUp({ to, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals).replace('.', ',')}
      {suffix}
    </span>
  );
}

/* ====== Data konten ====== */
const FEATURES = [
  {
    icon: UserGroupIcon,
    title: 'Kelompok Otomatis',
    description:
      'Cukup satu klik untuk bergabung — admin menempatkan Anda di kelompok berisi 7 jamaah untuk satu ekor sapi, sesuai syariat.',
  },
  {
    icon: BanknotesIcon,
    title: 'Menabung Fleksibel',
    description:
      'Lunasi sekaligus atau mencicil sesuai kemampuan. Progres tabungan kelompok terlihat jelas hingga target tercapai.',
  },
  {
    icon: CreditCardIcon,
    title: 'Pembayaran Instan',
    description:
      'Virtual Account, e-wallet, dan QRIS. Saldo terverifikasi otomatis dalam hitungan detik melalui payment gateway.',
  },
  {
    icon: BellAlertIcon,
    title: 'Notifikasi Real-time',
    description:
      'Pemberitahuan aplikasi dan WhatsApp saat Anda ditempatkan, plus pengumuman global setiap pembayaran berhasil.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Daftar Akun',
    description: 'Buat akun jamaah gratis dalam waktu kurang dari satu menit.',
  },
  {
    step: '02',
    title: 'Gabung Kelompok',
    description: 'Tekan satu tombol — admin menempatkan Anda di kelompok terbaik.',
  },
  {
    step: '03',
    title: 'Mulai Menabung',
    description: 'Setor tunai atau cicilan dengan metode pembayaran favorit Anda.',
  },
  {
    step: '04',
    title: 'Qurban Bersama',
    description: 'Setelah lunas, sapi qurban disembelih pada hari raya Idul Adha.',
  },
];

const SECURITY_POINTS = [
  'Setiap transaksi terekam dengan kwitansi digital yang dapat dicetak',
  'Password terenkripsi dan akses dilindungi autentikasi token',
  'Webhook pembayaran diverifikasi tanda tangan kriptografis',
  'Saldo kelompok diperbarui otomatis — bebas salah hitung manual',
];

const STATS = [
  { to: 7, decimals: 0, suffix: '', label: 'Jamaah per Kelompok' },
  { to: 3.4, decimals: 1, prefix: 'Rp', suffix: ' jt', label: 'Mulai per Porsi' },
  { to: 100, decimals: 0, suffix: '%', label: 'Transparan & Tercatat' },
  { to: 24, decimals: 0, suffix: '/7', label: 'Akses Kapan Saja' },
];

/* ====== Halaman ====== */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <PublicNavbar />

      {/* ===== HERO ===== */}
      <section className="relative isolate pt-16">
        {/* Latar animasi: grid + blob gradient */}
        <div className="bg-grid bg-grid-fade absolute inset-0 -z-20" />
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-blob absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-primary-400/30 blur-3xl dark:bg-primary-600/20" />
          <div className="animate-blob animation-delay-3000 absolute top-32 right-1/5 h-80 w-80 rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-500/20" />
          <div className="animate-blob animation-delay-6000 absolute -bottom-16 left-1/2 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-2">
          {/* Kiri: copy utama */}
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-4 py-1.5 text-sm font-semibold text-primary-700 backdrop-blur dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                <SparklesIcon className="h-4 w-4" />
                Mulai dari {formatRupiah(3400000)} per porsi
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl"
            >
              Wujudkan Niat Qurban, <span className="text-gradient">Menabung Bersama</span> Lebih
              Ringan
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
            >
              Platform tabungan qurban berjamaah: bergabung dengan kelompok, menyetor secara
              bertahap, dan memantau setiap rupiah secara real-time — sampai qurban Anda
              terlaksana.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-600/40"
              >
                Daftar Sekarang
                <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/60 px-7 py-3.5 text-base font-semibold text-slate-700 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sudah Punya Akun
              </Link>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
            >
              <CheckCircleIcon className="h-5 w-5 text-primary-600" />
              Gratis selamanya — tanpa biaya pendaftaran maupun administrasi.
            </motion.p>
          </motion.div>

          {/* Kanan: kartu kaca melayang (preview produk) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            className="relative mx-auto hidden w-full max-w-md lg:block"
            aria-hidden="true"
          >
            {/* Kartu utama: progres tabungan */}
            <div className="glass animate-float-slow rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/logo-masjid.png" alt="" className="h-10 w-10 object-contain" />
                  <div>
                    <p className="text-sm font-bold">Kelompok 01</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">7/7 anggota · Aktif</p>
                  </div>
                </div>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  87%
                </span>
              </div>
              <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">Terkumpul</p>
              <p className="text-3xl font-extrabold tracking-tight">{formatRupiah(20800000)}</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-400"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                dari target {formatRupiah(23800000)}
              </p>
            </div>

            {/* Kartu kecil: pembayaran sukses */}
            <div className="glass animate-float absolute -right-8 -top-10 w-56 rounded-2xl p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                </span>
                <div>
                  <p className="text-xs font-bold">Pembayaran Berhasil</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">QRIS · baru saja</p>
                </div>
              </div>
              <p className="mt-2.5 text-lg font-extrabold">{formatRupiah(500000)}</p>
            </div>

            {/* Kartu kecil: pengumuman global */}
            <div className="glass animate-float absolute -bottom-10 -left-10 w-64 rounded-2xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">
                👑 Pengumuman Global
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <strong>Ahmad F.</strong> melunasi {formatRupiah(3400000)} untuk Kelompok 01 —
                Barakallah! 🎉
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATISTIK ===== */}
      <section className="relative border-y border-slate-200/70 bg-white/50 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/30">
        <Reveal
          variants={stagger}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-4"
        >
          {STATS.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-gradient sm:text-5xl">
                <CountUp
                  to={stat.to}
                  decimals={stat.decimals}
                  prefix={stat.prefix || ''}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </Reveal>
      </section>

      {/* ===== FITUR ===== */}
      <section id="fitur" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Fitur</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Semua yang Anda butuhkan untuk <span className="text-gradient">qurban berjamaah</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Dirancang agar menabung qurban terasa semudah memakai aplikasi favorit Anda.
          </p>
        </Reveal>

        <Reveal variants={stagger} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass group rounded-3xl p-6"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-400 p-3 text-white shadow-lg shadow-primary-600/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </Reveal>
      </section>

      {/* ===== CARA KERJA ===== */}
      <section
        id="cara-kerja"
        className="relative scroll-mt-24 border-y border-slate-200/70 bg-slate-100/60 py-24 dark:border-slate-800/70 dark:bg-slate-900/40"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600">
              Cara Kerja
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Empat langkah menuju qurban
            </h2>
          </Reveal>

          <Reveal variants={stagger} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item, idx) => (
              <motion.div key={item.step} variants={fadeUp} className="relative">
                {idx < STEPS.length - 1 && (
                  <div className="absolute left-full top-9 z-0 hidden h-px w-6 bg-gradient-to-r from-primary-400 to-transparent lg:block" />
                )}
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group glass relative z-10 h-full rounded-3xl p-6"
                >
                  <span className="inline-block origin-left text-5xl font-extrabold text-primary-600/15 transition-all duration-300 group-hover:scale-110 group-hover:text-primary-600 group-hover:[text-shadow:0_0_18px_rgba(16,185,129,0.55)] dark:text-primary-400/15 dark:group-hover:text-primary-400">
                    {item.step}
                  </span>
                  <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ===== KEAMANAN ===== */}
      <section id="keamanan" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600">
              Keamanan & Transparansi
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Dana jamaah dijaga seperti <span className="text-gradient">amanah</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Setiap rupiah tercatat, terverifikasi, dan dapat diaudit kapan saja — oleh Anda
              sendiri.
            </p>
            <ul className="mt-8 space-y-4">
              {SECURITY_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-primary-600" />
                  <span className="text-slate-700 dark:text-slate-300">{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="relative">
            <div className="glass rounded-3xl p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-400 text-white shadow-lg shadow-primary-600/25">
                  <ShieldCheckIcon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-bold">Perlindungan Berlapis</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Standar keamanan aplikasi finansial
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { icon: LockClosedIcon, label: 'Enkripsi Password' },
                  { icon: DocumentCheckIcon, label: 'Kwitansi Digital' },
                  { icon: ShieldCheckIcon, label: 'Signature Webhook' },
                  { icon: BellAlertIcon, label: 'Audit Real-time' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-white/50 p-3.5 dark:border-slate-700/70 dark:bg-slate-800/50"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-primary-600" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-float absolute -right-4 -top-4 -z-10 h-full w-full rounded-3xl bg-gradient-to-br from-primary-500/15 to-emerald-400/15" />
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 via-emerald-600 to-teal-600 px-8 py-16 text-center shadow-2xl shadow-primary-600/30 sm:px-16">
            <div className="bg-grid absolute inset-0 opacity-20" />
            <div className="animate-blob absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="animate-blob animation-delay-3000 absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Siap memulai tabungan qurban Anda?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-50/90">
                Bergabunglah dengan jamaah lain yang sudah mewujudkan niat qurbannya secara
                berjamaah — gratis, tanpa biaya apa pun.
              </p>
              <Link
                to="/register"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-primary-700 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Buat Akun Gratis
                <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== LOKASI ===== */}
      <section
        id="lokasi"
        className="relative scroll-mt-24 border-t border-slate-200/70 bg-slate-100/60 py-24 dark:border-slate-800/70 dark:bg-slate-900/40"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Lokasi</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Kunjungi <span className="text-gradient">{MASJID.nama}</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Tempat ibadah sekaligus penyelenggara tabungan qurban berjamaah.
            </p>
          </Reveal>

          <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-5">
            {/* Info alamat */}
            <Reveal className="lg:col-span-2">
              <div className="glass flex h-full flex-col gap-6 rounded-3xl p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-400 text-white shadow-lg shadow-primary-600/25">
                    <MapPinIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-bold">Alamat</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {MASJID.alamat}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-400 text-white shadow-lg shadow-primary-600/25">
                    <ClockIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-bold">Pelayanan Qurban</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      Setiap hari, sepanjang tahun — daftar &amp; menabung kapan saja secara online.
                    </p>
                  </div>
                </div>
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700"
                >
                  Buka di Google Maps
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </Reveal>

            {/* Peta interaktif */}
            <Reveal className="lg:col-span-3">
              <div className="glass h-full overflow-hidden rounded-3xl p-2">
                <iframe
                  title={`Peta lokasi ${MASJID.nama}`}
                  src={MAP_EMBED}
                  className="h-[360px] w-full rounded-2xl lg:h-full"
                  style={{ border: 0, minHeight: '360px' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200/70 bg-white/50 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <img src="/logo-masjid.png" alt="Logo Tabungan Qurban" className="h-10 w-10 object-contain" />
                <span className="flex flex-col leading-tight">
                  <span className="text-lg font-bold">Tabungan Qurban</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {MASJID.nama}
                  </span>
                </span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Platform tabungan qurban berjamaah yang transparan, aman, dan mudah — dari niat
                hingga qurban terlaksana.
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                <span>{MASJID.alamat}</span>
              </p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Produk</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <a href="#fitur" className="transition-colors hover:text-primary-600">
                    Fitur
                  </a>
                </li>
                <li>
                  <a href="#cara-kerja" className="transition-colors hover:text-primary-600">
                    Cara Kerja
                  </a>
                </li>
                <li>
                  <a href="#keamanan" className="transition-colors hover:text-primary-600">
                    Keamanan
                  </a>
                </li>
                <li>
                  <LaporDeveloper
                    label="Lapor Bug / Saran"
                    className="block p-0 text-left text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300"
                  />
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Akun</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <Link to="/login" className="transition-colors hover:text-primary-600">
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="transition-colors hover:text-primary-600">
                    Daftar Jamaah
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-8 text-sm text-slate-500 sm:flex-row dark:border-slate-800/70 dark:text-slate-400">
            <p>&copy; {new Date().getFullYear()} Sistem Tabungan Qurban. Semua hak dilindungi.</p>
            <p>
              Dibuat dengan <span className="text-red-500">&hearts;</span> untuk jamaah Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
