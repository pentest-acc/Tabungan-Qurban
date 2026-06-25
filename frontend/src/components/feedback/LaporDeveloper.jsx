import { useState } from 'react';
import { toast } from 'react-toastify';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import feedbackService from '../../services/feedbackService';

const KATEGORI = [
  { v: 'bug', l: 'Laporan Bug' },
  { v: 'saran', l: 'Saran / Masukan' },
  { v: 'lainnya', l: 'Lainnya' },
];

// Tombol + modal "Lapor ke Developer". Tampilan tombol diatur lewat `className`,
// `label`, dan `withIcon` agar bisa dipakai di footer publik maupun sidebar.
export default function LaporDeveloper({ className = '', label = 'Lapor ke Developer', withIcon = false }) {
  const [open, setOpen] = useState(false);
  const [kategori, setKategori] = useState('bug');
  const [pesan, setPesan] = useState('');
  const [kontak, setKontak] = useState('');
  const [loading, setLoading] = useState(false);

  const tutup = () => {
    if (!loading) setOpen(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!pesan.trim()) {
      toast.error('Mohon isi pesan laporan terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      await feedbackService.kirim({ kategori, pesan: pesan.trim(), kontak: kontak.trim() });
      toast.success('Laporan terkirim. Terima kasih atas masukan Anda!');
      setPesan('');
      setKontak('');
      setKategori('bug');
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
