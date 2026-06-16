import { UserCircleIcon } from '@heroicons/react/24/solid';
import { resolveMediaUrl } from '../../utils/media';

// Avatar dengan BINGKAI beranimasi ala Discord / Mobile Legends.
// Struktur berlapis: cincin berputar (ring) + cahaya tema (glow) + efek
// partikel/kilatan (fx) di atas, dengan media di tengah. Mendukung gambar/GIF
// (<img>) maupun video (autoplay, mute, loop). Tanpa media → inisial, lalu ikon.
function inisial(nama = '') {
  const bagian = nama.trim().split(/\s+/).filter(Boolean);
  if (!bagian.length) return '';
  return (bagian[0][0] + (bagian[1]?.[0] || '')).toUpperCase();
}

export default function Avatar({
  src = '',
  tipe = 'gambar',
  border = 'none',
  nama = '',
  size = 40,
  className = '',
}) {
  const ini = inisial(nama);
  const mediaSrc = resolveMediaUrl(src);
  // Bingkai api memilih skala filter turbulensi sesuai ukuran (px tetap di SVG).
  const fireTier = border === 'api' ? (size > 64 ? ' avatar-frame--fire-lg' : ' avatar-frame--fire-sm') : '';

  return (
    <div
      className={`avatar-frame avatar-frame--${border}${fireTier} ${className}`}
      style={{ width: size, height: size, '--frame-size': `${size}px` }}
    >
      <span className="avatar-frame__ring" aria-hidden="true" />
      <span className="avatar-frame__glow" aria-hidden="true" />
      <span className="avatar-frame__fx" aria-hidden="true" />

      {/* Api: kerah api turbulen tipis di seluruh tepi + cahaya bara pada foto */}
      {border === 'api' && (
        <>
          <span className="avatar-frame__fire" aria-hidden="true" />
          <span className="avatar-frame__emberlight" aria-hidden="true" />
        </>
      )}

      {/* Bloody: huruf WARNING melayang naik berurutan, lalu kata utuh di tengah */}
      {border === 'bloody' && size >= 50 && (
        <span className="avatar-frame__warn" aria-hidden="true">
          {['W', 'A', 'R', 'N', 'I', 'N', 'G'].map((ch, i) => (
            <span key={i} className={`avatar-frame__warn-letter wl-${i}`}>
              {ch}
            </span>
          ))}
          <span className="avatar-frame__warn-full" data-text="WARNING">
            WARNING
          </span>
        </span>
      )}

      {/* Musik: alat musik (emitter) + not balok beragam melayang naik */}
      {border === 'musik' && (
        <>
          <span className="avatar-frame__note avatar-frame__note--1" aria-hidden="true">♪</span>
          <span className="avatar-frame__note avatar-frame__note--2" aria-hidden="true">♫</span>
          <span className="avatar-frame__note avatar-frame__note--3" aria-hidden="true">♬</span>
          <span className="avatar-frame__note avatar-frame__note--4" aria-hidden="true">♩</span>
          <span className="avatar-frame__instrument" aria-hidden="true">🎸</span>
        </>
      )}

      {/* Air: tetesan air menetes jatuh ke bawah seperti keringat */}
      {border === 'air' && (
        <>
          <span className="avatar-frame__drop avatar-frame__drop--1" aria-hidden="true" />
          <span className="avatar-frame__drop avatar-frame__drop--2" aria-hidden="true" />
          <span className="avatar-frame__drop avatar-frame__drop--3" aria-hidden="true" />
          <span className="avatar-frame__drop avatar-frame__drop--4" aria-hidden="true" />
        </>
      )}

      {/* Kosmik: komet jatuh dari kanan-atas ke kiri-bawah dengan ekor cahaya */}
      {border === 'kosmik' && (
        <span className="avatar-frame__sky" aria-hidden="true">
          <span className="avatar-frame__comet" />
        </span>
      )}

      <div className="avatar-frame__inner">
        {mediaSrc ? (
          tipe === 'video' ? (
            <video src={mediaSrc} className="h-full w-full object-cover" autoPlay loop muted playsInline />
          ) : (
            <img src={mediaSrc} alt={nama || 'Avatar'} className="h-full w-full object-cover" />
          )
        ) : ini ? (
          <span
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 to-emerald-500 font-bold text-white"
            style={{ fontSize: size * 0.38 }}
          >
            {ini}
          </span>
        ) : (
          <UserCircleIcon className="h-full w-full text-slate-300 dark:text-slate-600" />
        )}
      </div>
    </div>
  );
}
