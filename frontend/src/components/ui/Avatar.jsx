import { UserCircleIcon } from '@heroicons/react/24/solid';
import { resolveMediaUrl } from '../../utils/media';

// Avatar dengan border beranimasi ala Discord. Mendukung media gambar/GIF
// (otomatis dari <img>) maupun video (autoplay, mute, loop). Jika tidak ada
// media, menampilkan inisial nama, atau ikon default bila nama pun kosong.
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
  return (
    <div
      className={`avatar-ring avatar-ring--${border} ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="avatar-ring__inner">
        {mediaSrc ? (
          tipe === 'video' ? (
            <video
              src={mediaSrc}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
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
