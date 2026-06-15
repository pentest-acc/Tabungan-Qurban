import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import broadcastService from '../../services/broadcastService';
import { formatRupiah } from '../../utils/format';

// Pengumuman pembayaran global ala siaran gol Liga Inggris — EVENT DRIVEN:
// setiap pembayaran tampil SEKALI (intro "GOAL" lalu running text), kemudian
// barnya MENGHILANG (height collapse) sehingga tidak ada kotak kosong tersisa.
// Polling tiap 5 detik; pembayaran baru masuk antrian dan diumumkan berurutan.
const TIER_STYLE = {
  common: {
    wrap: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    durasi: '14s',
    ikon: '💰',
    efek: '',
  },
  rare: {
    wrap: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
    durasi: '12s',
    ikon: '✨',
    efek: '',
  },
  epic: {
    wrap: 'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200',
    durasi: '11s',
    ikon: '🌟',
    efek: 'font-semibold',
  },
  legendary: {
    wrap: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 shadow-md',
    durasi: '16s',
    ikon: '👑',
    efek: 'font-bold animate-glow',
  },
};

function formatTanggalJam(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { tanggal: '-', jam: '-' };
  return {
    tanggal: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    jam: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
  };
}

// Label singkat pada "papan skor" — tanpa kata GOL, hanya status pembayaran.
function labelUntuk(item) {
  return item.jenis_transaksi === 'tunai' ? 'LUNAS' : 'SETORAN';
}

const DURASI_INTRO = 1500; // ms — lama intro "GOAL" sebelum running text

export default function PaymentMarquee() {
  const [queue, setQueue] = useState([]); // antrian pengumuman yang menunggu tampil
  const [current, setCurrent] = useState(null); // pengumuman yang sedang tampil
  const [fase, setFase] = useState('intro'); // 'intro' (pop GOAL) → 'scroll' (running text)
  const dikenalRef = useRef(new Set());
  const muatPertamaRef = useRef(true);

  const muat = useCallback(async () => {
    try {
      const data = await broadcastService.pembayaranTerbaru();
      const list = Array.isArray(data) ? data : [];

      const baru = list.filter((trx) => !dikenalRef.current.has(trx.id_transaksi));
      baru.forEach((trx) => dikenalRef.current.add(trx.id_transaksi));
      if (baru.length === 0) return;

      if (muatPertamaRef.current) {
        // Saat pertama dibuka: cukup umumkan SATU pembayaran terbaru sebagai sambutan,
        // lalu hilang — tidak membanjiri layar dengan seluruh riwayat lama.
        setQueue((q) => [...q, baru[0]]);
      } else {
        // Pembayaran baru real-time: tampilkan berurutan dari yang terlama ke terbaru.
        setQueue((q) => [...q, ...[...baru].reverse()]);
      }
      muatPertamaRef.current = false;
    } catch {
      // broadcast bersifat dekoratif — abaikan kegagalan
    }
  }, []);

  useEffect(() => {
    muat();
    const id = setInterval(muat, 5000);
    return () => clearInterval(id);
  }, [muat]);

  // Saat tidak ada yang tampil, ambil pengumuman berikutnya dari antrian.
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setFase('intro');
      setQueue((q) => q.slice(1));
    }
  }, [current, queue]);

  // Fase intro "GOAL" → beralih ke running text.
  useEffect(() => {
    if (!current || fase !== 'intro') return undefined;
    const t = setTimeout(() => setFase('scroll'), DURASI_INTRO);
    return () => clearTimeout(t);
  }, [current, fase]);

  // Pengaman: jika onAnimationEnd tidak terpicu, tetap lanjut setelah durasi tier.
  useEffect(() => {
    if (!current || fase !== 'scroll') return undefined;
    const tier = TIER_STYLE[current.tier] || TIER_STYLE.common;
    const ms = (parseFloat(tier.durasi) || 14) * 1000 + 800;
    const t = setTimeout(() => setCurrent(null), ms);
    return () => clearTimeout(t);
  }, [current, fase]);

  const tier = current ? TIER_STYLE[current.tier] || TIER_STYLE.common : null;
  const { tanggal, jam } = current
    ? formatTanggalJam(current.tanggal_bayar)
    : { tanggal: '-', jam: '-' };
  const pesan = current
    ? current.jenis_transaksi === 'tunai'
      ? `${current.nama_jamaah} MELUNASI ${formatRupiah(current.total_bayar)} untuk Kelompok ${current.nomor_kelompok} pada ${tanggal} jam ${jam} — Barakallah! 🎉`
      : `${current.nama_jamaah} membayar ${formatRupiah(current.total_bayar)} untuk Kelompok ${current.nomor_kelompok} pada ${tanggal} jam ${jam}`
    : '';

  return (
    <AnimatePresence initial={false}>
      {current && tier && (
        <motion.div
          key={current.id_transaksi}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className={`relative overflow-hidden border-b border-slate-200 dark:border-slate-800 ${tier.wrap}`}
        >
          {fase === 'intro' ? (
            // ===== Intro "papan skor" ala siaran TV — panel merakit + flash + shine =====
            <div className="goal-flash flex items-center justify-center py-1.5">
              <div className="goal-shine flex items-stretch overflow-hidden rounded-md text-sm shadow-sm">
                {/* Tab status meluncur dari kiri */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-1.5 whitespace-nowrap bg-slate-900/90 px-2.5 py-1 text-white dark:bg-black/70"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.12, type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    {tier.ikon}
                  </motion.span>
                  <span className="text-xs font-extrabold uppercase tracking-widest">
                    {labelUntuk(current)}
                  </span>
                </motion.div>

                {/* Panel nama — efek papan skor "berganti" (slide naik) */}
                <div className="flex items-center overflow-hidden bg-white px-3 py-1 dark:bg-slate-900">
                  <motion.span
                    initial={{ y: '130%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.18, duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    className="whitespace-nowrap font-bold text-slate-800 dark:text-slate-100"
                  >
                    {current.nama_jamaah}
                    <span className="mx-1.5 text-slate-300 dark:text-slate-600">|</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Kelompok {current.nomor_kelompok}
                    </span>
                  </motion.span>
                </div>

                {/* Badge nominal memantul masuk */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.34, type: 'spring', stiffness: 480, damping: 17 }}
                  className="flex items-center whitespace-nowrap bg-primary-600 px-3 py-1 font-extrabold text-white"
                >
                  {formatRupiah(current.total_bayar)}
                </motion.div>
              </div>
            </div>
          ) : (
            // ===== Running text =====
            <div
              key="scroll"
              className="marquee-track whitespace-nowrap py-1.5 text-sm"
              style={{ animationDuration: tier.durasi }}
              onAnimationEnd={() => setCurrent(null)}
            >
              <span className={tier.efek}>
                {tier.ikon} {pesan} {tier.ikon}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
