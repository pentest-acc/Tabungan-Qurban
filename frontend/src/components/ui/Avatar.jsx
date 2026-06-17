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
  cropScale = 1,
  cropX = 50,
  cropY = 50,
}) {
  const ini = inisial(nama);
  const mediaSrc = resolveMediaUrl(src);
  // Bingkai api memilih skala filter turbulensi sesuai ukuran (px tetap di SVG).
  const fireTier = border === 'api' ? (size > 64 ? ' avatar-frame--fire-lg' : ' avatar-frame--fire-sm') : '';
  // Framing media (zoom + posisi fokus) — berlaku gambar/gif/video, animasi utuh.
  const mediaStyle = {
    objectPosition: `${cropX}% ${cropY}%`,
    transform: `scale(${cropScale})`,
    transformOrigin: `${cropX}% ${cropY}%`,
  };

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

      {/* Bloody: teks glitch WARNING muncul di tengah foto tiap 3 detik */}
      {border === 'bloody' && (
        <span className="avatar-frame__warn-full" data-text="WARNING" aria-hidden="true">
          WARNING
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

      {/* Kosmik: komet meluncur ke tengah lalu MELEDAK jadi 8 bintang ke segala
          arah (hingga keluar bingkai). Komet dalam wadah lingkaran (terpotong),
          bintang ledakan sebagai anak langsung agar bisa terbang keluar. */}
      {border === 'kosmik' && (
        <>
          <span className="avatar-frame__sky" aria-hidden="true">
            <span className="avatar-frame__comet" />
          </span>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            return (
              <span
                key={i}
                className="avatar-frame__star"
                aria-hidden="true"
                style={{
                  '--tx': `calc(var(--frame-size, 40px) * ${(Math.cos(a) * 0.85).toFixed(3)})`,
                  '--ty': `calc(var(--frame-size, 40px) * ${(Math.sin(a) * 0.85).toFixed(3)})`,
                }}
              >
                ✦
              </span>
            );
          })}
        </>
      )}

      <div className="avatar-frame__inner">
        {mediaSrc ? (
          tipe === 'video' ? (
            <video
              src={mediaSrc}
              className="h-full w-full object-cover"
              style={mediaStyle}
              autoPlay
              loop
              muted
              playsInline
              draggable={false}
            />
          ) : (
            <img
              src={mediaSrc}
              alt={nama || 'Avatar'}
              className="h-full w-full object-cover"
              style={mediaStyle}
              draggable={false}
            />
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
