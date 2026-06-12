import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { formatRupiah } from '../../utils/format';

const FEATURES = [
  {
    icon: UserGroupIcon,
    title: 'Kelompok Qurban',
    description:
      'Bergabung dengan kelompok berisi maksimal 7 jamaah untuk satu ekor sapi qurban, sesuai syariat.',
  },
  {
    icon: BanknotesIcon,
    title: 'Menabung Fleksibel',
    description:
      'Bayar tunai sekaligus atau mencicil sesuai kemampuan hingga tanggal berakhir periode kelompok.',
  },
  {
    icon: CreditCardIcon,
    title: 'Pembayaran Mudah',
    description:
      'Setor dana melalui transfer bank maupun e-wallet. Saldo tabungan terupdate otomatis secara real-time.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Transparan & Aman',
    description:
      'Setiap transaksi tercatat lengkap dengan bukti pembayaran dan dapat dipantau kapan saja.',
  },
];

const STEPS = [
  { step: '1', title: 'Daftar Akun', description: 'Buat akun jamaah secara gratis hanya dalam beberapa menit.' },
  { step: '2', title: 'Gabung Kelompok', description: 'Pilih kelompok qurban aktif dan ajukan permintaan bergabung.' },
  { step: '3', title: 'Mulai Menabung', description: 'Setor tabungan secara tunai atau cicilan sampai tagihan lunas.' },
  { step: '4', title: 'Qurban Bersama', description: 'Setelah lunas, sapi qurban disembelih pada hari raya Idul Adha.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-primary-600/10" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="mb-4 inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            Mulai dari {formatRupiah(3400000)} per porsi
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Wujudkan Niat Qurban dengan <span className="text-primary-600">Menabung Bersama</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Sistem Tabungan Qurban membantu Anda bergabung dengan kelompok, menabung secara
            bertahap, dan memantau progres tabungan hingga qurban terlaksana.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-primary !px-6 !py-3 !text-base">
              Daftar Sekarang
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link to="/login" className="btn-secondary !px-6 !py-3 !text-base">
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold">Kenapa Menabung di Sini?</h2>
        <p className="mt-2 text-center text-slate-500 dark:text-slate-400">
          Fitur lengkap untuk memudahkan ibadah qurban Anda
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cara kerja */}
      <section className="bg-slate-100 py-16 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold">Cara Kerja</h2>
          <p className="mt-2 text-center text-slate-500 dark:text-slate-400">
            Empat langkah mudah menuju qurban bersama
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div key={item.step} className="card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="card bg-primary-600 p-10 text-center !text-white dark:bg-primary-700">
          <h2 className="text-3xl font-bold text-white">Siap Memulai Tabungan Qurban?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-100">
            Daftar sekarang dan bergabunglah dengan ribuan jamaah lain yang sudah mewujudkan
            niat qurbannya secara berjamaah.
          </p>
          <Link
            to="/register"
            className="btn mt-6 bg-white !text-primary-700 hover:bg-primary-50 focus:ring-white"
          >
            Buat Akun Gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        &copy; {new Date().getFullYear()} Sistem Tabungan Qurban. Semua hak dilindungi.
      </footer>
    </div>
  );
}
