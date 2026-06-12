import { useEffect, useRef, useState, useCallback } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import notifikasiService from '../../services/notifikasiService';
import { formatDateTime } from '../../utils/format';

// Lonceng notifikasi in-app untuk jamaah (penempatan kelompok, dll).
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifikasi, setNotifikasi] = useState([]);
  const [belumDibaca, setBelumDibaca] = useState(0);
  const ref = useRef(null);

  const muat = useCallback(async () => {
    try {
      const data = await notifikasiService.getMine();
      setNotifikasi(data?.notifikasi ?? []);
      setBelumDibaca(data?.belum_dibaca ?? 0);
    } catch {
      // notifikasi bersifat tambahan — kegagalan tidak perlu mengganggu UI
    }
  }, []);

  useEffect(() => {
    muat();
    const id = setInterval(muat, 30000); // polling tiap 30 detik
    return () => clearInterval(id);
  }, [muat]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buka = async () => {
    const akanBuka = !open;
    setOpen(akanBuka);
    if (akanBuka && belumDibaca > 0) {
      try {
        await notifikasiService.tandaiBaca();
        setBelumDibaca(0);
      } catch {
        /* abaikan */
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={buka}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Notifikasi"
      >
        <BellIcon className="h-5 w-5" />
        {belumDibaca > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {belumDibaca > 9 ? '9+' : belumDibaca}
          </span>
        )}
      </button>

      {open && (
        <div className="card absolute right-0 mt-2 w-80 overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-800">
            Notifikasi
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifikasi.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Belum ada notifikasi.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {notifikasi.map((item) => (
                  <li key={item.id_notifikasi || item._id} className="px-4 py-3">
                    <p className="text-sm font-semibold">{item.judul}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.pesan}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{formatDateTime(item.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
