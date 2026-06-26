import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ChatBubbleLeftRightIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import feedbackService from '../../services/feedbackService';

const KATEGORI = [
  { v: 'bug', l: 'Laporan Bug' },
  { v: 'saran', l: 'Saran / Masukan' },
  { v: 'lainnya', l: 'Lainnya' },
];
const MAKS_MB = 8;

// Tombol + modal "Lapor ke Developer". Tampilan tombol diatur lewat `className`,
// `label`, dan `withIcon`. Mendukung lampiran 1 gambar.
export default function LaporDeveloper({ className = '', label = 'Lapor ke Developer', withIcon = false }) {
  const [open, setOpen] = useState(false);
  const [kategori, setKategori] = useState('bug');
  const [pesan, setPesan] = useState('');
  const [kontak, setKontak] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const objectUrlRef = useRef('');

  const bersihkanPreview = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = '';
    }
    setPreviewUrl('');
    setFile(null);
  };

  const tutup = () => {
    if (loading) return;
    setOpen(false);
  };

  const pilihGambar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Lampiran harus berupa gambar.');
      return;
    }
    if (f.size > MAKS_MB * 1024 * 1024) {
      toast.error(`Ukuran gambar maksimal ${MAKS_MB}MB.`);
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setFile(f);
    setPreviewUrl(url);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!pesan.trim()) {
      toast.error('Mohon isi pesan laporan terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('kategori', kategori);
      form.append('pesan', pesan.trim());
      form.append('kontak', kontak.trim());
      if (file) form.append('lampiran', file);
      await feedbackService.kirim(form);
      toast.success('Laporan terkirim. Terima kasih atas masukan Anda!');
      setPesan('');
      setKontak('');
      setKategori('bug');
      bersihkanPreview();
      setOpen(false);
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim laporan, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {withIcon && <ChatBubbleLeftRightIcon className="h-5 w-5 shrink-0" />}
        {label}
      </button>

      <Modal open={open} onClose={tutup} title="Lapor ke Developer" maxWidth="max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Temukan bug, kendala, atau punya saran? Sampaikan di sini — laporan dikirim langsung ke
            developer.
          </p>

          <div>
            <label className="label">Kategori</label>
            <select className="input" value={kategori} onChange={(e) => setKategori(e.target.value)}>
              {KATEGORI.map((k) => (
                <option key={k.v} value={k.v}>
                  {k.l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Pesan</label>
            <textarea
              className="input"
              rows={4}
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Jelaskan bug yang Anda temui atau saran Anda..."
              maxLength={4000}
            />
          </div>

          {/* Lampiran gambar (opsional) */}
          <div>
            <label className="label">Lampiran Gambar (opsional)</label>
            {previewUrl ? (
              <div className="relative w-fit">
                <img
                  src={previewUrl}
                  alt="Pratinjau lampiran"
                  className="max-h-40 rounded-lg border border-slate-200 object-contain dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={bersihkanPreview}
                  className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                  aria-label="Hapus lampiran"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-slate-600 dark:text-slate-400"
              >
                <PhotoIcon className="h-5 w-5" />
                Pilih gambar (mis. screenshot)
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={pilihGambar}
            />
          </div>

          <div>
            <label className="label">Kontak (opsional)</label>
            <input
              className="input"
              value={kontak}
              onChange={(e) => setKontak(e.target.value)}
              placeholder="Email / No. WA bila ingin dihubungi balik"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={tutup} disabled={loading}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Spinner className="h-4 w-4 text-white" />}
              Kirim Laporan
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
