import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowUpTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import profilService from '../../services/profilService';
import { BORDER_PROFIL } from '../../constants/borderProfil';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

const MAKS_MB = 12;

// Editor media profil: unggah foto/GIF/video + pilih border beranimasi.
// Dipakai bersama oleh halaman profil jamaah maupun admin.
export default function EditorProfilMedia() {
  const { user, updateUser } = useAuth();
  const inputRef = useRef(null);
  const objectUrlRef = useRef('');

  const [border, setBorder] = useState(user?.border_profil || 'none');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [tipePreview, setTipePreview] = useState('gambar');
  const [saving, setSaving] = useState(false);

  // Bersihkan object URL saat komponen dilepas.
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
  };

  const src = previewUrl || user?.foto_profil || '';
  const tipe = previewUrl ? tipePreview : user?.tipe_media || 'gambar';
  const adaPerubahan = !!file || border !== (user?.border_profil || 'none');

  const simpan = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('border_profil', border);
      if (file) form.append('foto', file);
      const hasil = await profilService.update(form);
      updateUser({
        foto_profil: hasil.foto_profil,
        tipe_media: hasil.tipe_media,
        border_profil: hasil.border_profil,
      });
      setFile(null);
      setPreviewUrl('');
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = '';
      }
      toast.success('Foto & border profil berhasil disimpan');
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-semibold">Foto & Border Profil</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Unggah foto, GIF, atau video, lalu pilih border beranimasi favorit Anda.
      </p>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* Pratinjau utama */}
        <div className="flex flex-col items-center gap-3">
          <Avatar src={src} tipe={tipe} border={border} nama={user?.nama_lengkap} size={128} />
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
                  <Avatar src={src} tipe={tipe} border={b.key} nama={user?.nama_lengkap} size={52} />
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
