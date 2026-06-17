import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowUpTrayIcon, CheckIcon, MagnifyingGlassPlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import profilService from '../../services/profilService';
import { BORDER_PROFIL } from '../../constants/borderProfil';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

const MAKS_MB = 12;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Editor media profil: unggah foto/GIF/video + crop (zoom & geser) + pilih border.
// Crop disimpan sbg metadata & diterapkan via CSS, sehingga animasi GIF/video utuh.
export default function EditorProfilMedia() {
  const { user, updateUser } = useAuth();
  const inputRef = useRef(null);
  const objectUrlRef = useRef('');
  const dragRef = useRef(null);

  const [border, setBorder] = useState(user?.border_profil || 'none');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [tipePreview, setTipePreview] = useState('gambar');
  const [saving, setSaving] = useState(false);

  // Parameter crop/framing
  const [cropScale, setCropScale] = useState(user?.crop_scale ?? 1);
  const [cropX, setCropX] = useState(user?.crop_x ?? 50);
  const [cropY, setCropY] = useState(user?.crop_y ?? 50);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const pilihBerkas = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isVideo = f.type.startsWith('video/');
    const isImage = /^image\/(png|jpe?g|webp|gif)$/.test(f.type);
    if (!isVideo && !isImage) {
      toast.error('Format tidak didukung. Gunakan PNG/JPG/WEBP/GIF atau MP4/WEBM.');
      return;
    }
    if (f.size > MAKS_MB * 1024 * 1024) {
      toast.error(`Ukuran berkas maksimal ${MAKS_MB}MB.`);
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setFile(f);
    setPreviewUrl(url);
    setTipePreview(isVideo ? 'video' : 'gambar');
    // media baru → reset framing
    setCropScale(1);
    setCropX(50);
    setCropY(50);
  };

  const src = previewUrl || user?.foto_profil || '';
  const tipe = previewUrl ? tipePreview : user?.tipe_media || 'gambar';
  const adaMedia = !!src;

  // Geser fokus crop dengan drag pada pratinjau.
  const onPointerDown = (e) => {
    if (!adaMedia) return;
    dragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    const k = 0.32; // sensitivitas geser
    setCropX((v) => clamp(v - dx * k, 0, 100));
    setCropY((v) => clamp(v - dy * k, 0, 100));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };
  const resetCrop = () => {
    setCropScale(1);
    setCropX(50);
    setCropY(50);
  };

  const cropBerubah =
    cropScale !== (user?.crop_scale ?? 1) ||
    cropX !== (user?.crop_x ?? 50) ||
    cropY !== (user?.crop_y ?? 50);
  const adaPerubahan = !!file || border !== (user?.border_profil || 'none') || cropBerubah;

  const simpan = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('border_profil', border);
      form.append('crop_scale', String(cropScale));
      form.append('crop_x', String(Math.round(cropX)));
      form.append('crop_y', String(Math.round(cropY)));
      if (file) form.append('foto', file);
      const hasil = await profilService.update(form);
      updateUser({
        foto_profil: hasil.foto_profil,
        tipe_media: hasil.tipe_media,
        border_profil: hasil.border_profil,
        crop_scale: hasil.crop_scale,
        crop_x: hasil.crop_x,
        crop_y: hasil.crop_y,
      });
      setFile(null);
      setPreviewUrl('');
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = '';
      }
      toast.success('Profil berhasil disimpan');
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-semibold">Foto, Crop &amp; Border Profil</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Unggah foto/GIF/video, atur bingkai (zoom &amp; geser), lalu pilih border beranimasi.
      </p>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* Pratinjau + crop */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative" style={{ width: 128, height: 128 }}>
            <Avatar
              src={src}
              tipe={tipe}
              border={border}
              nama={user?.nama_lengkap}
              size={128}
              cropScale={cropScale}
              cropX={cropX}
              cropY={cropY}
            />
            {/* Overlay transparan: area seret yang SERAGAM untuk gambar & video,
                karena event pointer tidak selalu diteruskan oleh elemen <video>. */}
            {adaMedia && (
              <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                className="absolute inset-0 cursor-move touch-none rounded-full"
                style={{ zIndex: 10 }}
                title="Seret untuk menggeser fokus"
              />
            )}
          </div>

          {/* Zoom */}
          <div className="flex w-44 items-center gap-2">
            <MagnifyingGlassPlusIcon className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={cropScale}
              disabled={!adaMedia}
              onChange={(e) => setCropScale(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-primary-600 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={resetCrop}
              disabled={!adaMedia}
              title="Reset crop"
              className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-secondary !py-1.5 text-xs"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            Pilih Media
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
            className="hidden"
            onChange={pilihBerkas}
          />
          <p className="max-w-[12rem] text-center text-[11px] text-slate-400">
            PNG, JPG, WEBP, GIF, atau MP4/WEBM — maksimal {MAKS_MB}MB.
            {adaMedia && ' Seret gambar untuk menggeser fokus.'}
          </p>
        </div>

        {/* Pilihan border */}
        <div className="flex-1">
          <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            Pilih Border Beranimasi
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {BORDER_PROFIL.map((b) => {
              const aktif = border === b.key;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setBorder(b.key)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors ${
                    aktif
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <Avatar
                    src={src}
                    tipe={tipe}
                    border={b.key}
                    nama={user?.nama_lengkap}
                    size={52}
                    cropScale={cropScale}
                    cropX={cropX}
                    cropY={cropY}
                  />
                  <span className="flex items-center gap-0.5 text-[10px] font-medium leading-tight">
                    {aktif && <CheckIcon className="h-3 w-3 text-primary-600" />}
                    {b.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={simpan} className="btn-primary" disabled={saving || !adaPerubahan}>
          {saving && <Spinner className="h-4 w-4 text-white" />}
          Simpan Profil
        </button>
      </div>
    </div>
  );
}
