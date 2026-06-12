import { useEffect, useRef, useState, useCallback } from 'react';
import broadcastService from '../../services/broadcastService';
import { formatRupiah } from '../../utils/format';

// Running text global ala pengumuman game online — REAL TIME:
// polling tiap 5 detik; pembayaran yang baru masuk langsung diumumkan lebih
// dulu (antrian prioritas), sisanya dirotasi dari riwayat terbaru.
const TIER_STYLE = {
  common: {
    wrap: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    durasi: '14s',
    ikon: '💰',
    efek: '',
  },
  rare: {
    wrap: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    durasi: '12s',
    ikon: '✨',
    efek: '',
  },
  epic: {
    wrap: 'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    durasi: '10s',
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

export default function PaymentMarquee() {
  const [items, setItems] = useState([]);
  const [antrian, setAntrian] = useState([]); // pembayaran baru (real-time), tampil lebih dulu
  const [index, setIndex] = useState(0);
  const dikenalRef = useRef(new Set());
  const muatPertamaRef = useRef(true);

  const muat = useCallback(async () => {
    try {
      const data = await broadcastService.pembayaranTerbaru();
      const list = Array.isArray(data) ? data : [];
      setItems(list);

      const baru = list.filter((trx) => !dikenalRef.current.has(trx.id_transaksi));
      baru.forEach((trx) => dikenalRef.current.add(trx.id_transaksi));
      // Muat pertama = riwayat lama, bukan kejadian baru — jangan dianggap real-time.
      if (!muatPertamaRef.current && baru.length > 0) {
        setAntrian((queue) => [...queue, ...baru]);
      }
      muatPertamaRef.current = false;
    } catch {
      // broadcast bersifat dekoratif — abaikan kegagalan
    }
  }, []);

  useEffect(() => {
    muat();
    const id = setInterval(muat, 5000); // real-time: cek pembayaran baru tiap 5 detik
    return () => clearInterval(id);
  }, [muat]);

  const selesaiSatuPutaran = () => {
    if (antrian.length > 0) {
      setAntrian((queue) => queue.slice(1));
    } else {
      setIndex((i) => (i + 1) % Math.max(1, items.length));
    }
  };

  // Prioritaskan pengumuman real-time; jika kosong, rotasi riwayat terbaru.
  const item = antrian[0] || items[index % Math.max(1, items.length)];
  if (!item) return null;

  const tier = TIER_STYLE[item.tier] || TIER_STYLE.common;
  const { tanggal, jam } = formatTanggalJam(item.tanggal_bayar);
  const pesan =
    item.jenis_transaksi === 'tunai'
      ? `${item.nama_jamaah} MELUNASI ${formatRupiah(item.total_bayar)} untuk Kelompok ${item.nomor_kelompok} pada tanggal ${tanggal} jam ${jam}! Barakallah! 🎉`
      : `${item.nama_jamaah} membayar ${formatRupiah(item.total_bayar)} untuk Kelompok ${item.nomor_kelompok} pada tanggal ${tanggal} jam ${jam}`;

  return (
    <div className={`relative overflow-hidden border-b border-slate-200 dark:border-slate-800 ${tier.wrap}`}>
      <div
        // key memaksa render ulang agar animasi mulai dari awal untuk tiap pesan
        key={`${item.id_transaksi}-${antrian.length}-${index}`}
        className="marquee-track whitespace-nowrap py-1.5 text-sm"
        style={{ animationDuration: tier.durasi }}
        onAnimationEnd={selesaiSatuPutaran}
      >
        <span className={tier.efek}>
          {tier.ikon} {pesan} {tier.ikon}
        </span>
      </div>
    </div>
  );
}
