import { useEffect, useState, useCallback } from 'react';
import broadcastService from '../../services/broadcastService';
import { formatRupiah } from '../../utils/format';

// Running text global ala pengumuman game online: setiap pembayaran sukses
// dirayakan ke seluruh pengguna (jamaah, admin, kepala admin) dengan gaya
// animasi berbeda sesuai tier nominal pembayaran.
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

export default function PaymentMarquee() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  const muat = useCallback(async () => {
    try {
      const data = await broadcastService.pembayaranTerbaru();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      // broadcast bersifat dekoratif — abaikan kegagalan
    }
  }, []);

  useEffect(() => {
    muat();
    const id = setInterval(muat, 20000); // tarik pengumuman baru tiap 20 detik
    return () => clearInterval(id);
  }, [muat]);

  if (items.length === 0) return null;

  const item = items[index % items.length];
  const tier = TIER_STYLE[item.tier] || TIER_STYLE.common;
  const pesan =
    item.jenis_transaksi === 'tunai'
      ? `${item.nama_jamaah} MELUNASI ${formatRupiah(item.total_bayar)} untuk Kelompok ${item.nomor_kelompok}! Barakallah! 🎉`
      : `${item.nama_jamaah} membayar ${formatRupiah(item.total_bayar)} untuk Kelompok ${item.nomor_kelompok}`;

  return (
    <div className={`relative overflow-hidden border-b border-slate-200 dark:border-slate-800 ${tier.wrap}`}>
      <div
        // key memaksa render ulang agar animasi mulai dari awal untuk tiap pesan
        key={`${item.id_transaksi}-${index}`}
        className="marquee-track whitespace-nowrap py-1.5 text-sm"
        style={{ animationDuration: tier.durasi }}
        onAnimationEnd={() => setIndex((i) => (i + 1) % items.length)}
      >
        <span className={tier.efek}>
          {tier.ikon} {pesan} {tier.ikon}
        </span>
      </div>
    </div>
  );
}
