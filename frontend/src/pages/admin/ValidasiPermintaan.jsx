import { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import useTableControls from '../../hooks/useTableControls';
import permintaanService from '../../services/permintaanService';
import kelompokService from '../../services/kelompokService';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/format';

export default function ValidasiPermintaan() {
  const { data, loading, error, refetch } = useFetch(() => permintaanService.getAll(), []);
  const kelompokFetch = useFetch(() => kelompokService.getAll(), []);
  const controls = useTableControls(data, {
    searchFields: ['nama_jamaah', 'id_jamaah', 'nomor_kelompok', 'id_kelompok'],
    filterFn: (item, filter) => {
      const s = String(item.status || '').toLowerCase();
      if (filter === 'pending') return ['pending', 'menunggu', 'menunggu persetujuan'].includes(s);
      return s === filter;
    },
  });

  // Penempatan: admin memilih kelompok untuk jamaah yang diterima.
  const [menempatkan, setMenempatkan] = useState(null); // permintaan yang sedang diproses
  const [kelompokTujuan, setKelompokTujuan] = useState('');
  const [menolak, setMenolak] = useState(null);
  const [processing, setProcessing] = useState(false);

  const kelompokList = Array.isArray(kelompokFetch.data)
    ? kelompokFetch.data
    : kelompokFetch.data?.data ?? [];
  // Hanya kelompok aktif yang kuotanya belum penuh.
  const kelompokTersedia = kelompokList.filter(
    (kelompok) =>
      String(kelompok.status || '').toLowerCase() === 'aktif' &&
      (kelompok.jumlah_anggota ?? kelompok.anggota?.length ?? 0) < 7
  );

  const bukaPenempatan = (permintaan) => {
    setKelompokTujuan(kelompokTersedia[0]?.id_kelompok || '');
    setMenempatkan(permintaan);
  };

  const handleTerima = async () => {
    if (!kelompokTujuan) {
      toast.error('Pilih kelompok tujuan terlebih dahulu');
      return;
    }
    setProcessing(true);
    try {
      await permintaanService.terima(menempatkan.id_permintaan || menempatkan._id, {
        id_kelompok: kelompokTujuan,
      });
      toast.success('Jamaah ditempatkan — notifikasi aplikasi & WhatsApp dikirim');
      setMenempatkan(null);
      refetch();
      kelompokFetch.refetch();
    } catch (err) {
      toast.error(err.message || 'Gagal memproses permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const handleTolak = async () => {
    setProcessing(true);
    try {
      await permintaanService.tolak(menolak.id_permintaan || menolak._id);
      toast.info('Permintaan bergabung ditolak');
      setMenolak(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Gagal memproses permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const isPending = (item) =>
    ['pending', 'menunggu', 'menunggu persetujuan'].includes(String(item.status || '').toLowerCase());

  return (
    <div>
      <PageHeader
        title="Validasi Permintaan Bergabung"
        subtitle="Tentukan kelompok untuk jamaah yang ingin bergabung, atau tolak permintaannya"
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800">
          <SearchInput
            value={controls.search}
            onChange={controls.setSearch}
            placeholder="Cari nama jamaah / kelompok..."
          />
          <select
            className="input sm:max-w-[200px]"
            value={controls.filter}
            onChange={(e) => controls.setFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Persetujuan</option>
            <option value="diterima">Diterima</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : controls.pageItems.length === 0 ? (
          <EmptyState
            title="Tidak Ada Permintaan"
            message="Permintaan bergabung dari jamaah akan tampil di sini."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="table-th">Jamaah</th>
                    <th className="table-th">Kelompok</th>
                    <th className="table-th">Tanggal Pengajuan</th>
                    <th className="table-th">Catatan</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {controls.pageItems.map((item) => (
                    <tr key={item.id_permintaan || item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="table-td font-medium">
                        {item.jamaah?.nama_lengkap || item.nama_jamaah || item.id_jamaah}
                      </td>
                      <td className="table-td">
                        {item.nomor_kelompok ? (
                          `Kelompok ${item.nomor_kelompok}`
                        ) : (
                          <span className="text-xs italic text-slate-400">belum ditentukan</span>
                        )}
                      </td>
                      <td className="table-td">{formatDateTime(item.tanggal_pengajuan || item.createdAt)}</td>
                      <td className="table-td max-w-[200px] truncate">{item.catatan || '-'}</td>
                      <td className="table-td">
                        <Badge variant={statusVariant(item.status)}>{item.status || 'pending'}</Badge>
                      </td>
                      <td className="table-td">
                        {isPending(item) ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => bukaPenempatan(item)}
                              className="btn-primary !px-3 !py-1.5 !text-xs"
                            >
                              <CheckIcon className="h-4 w-4" />
                              Terima & Tempatkan
                            </button>
                            <button
                              onClick={() => setMenolak(item)}
                              className="btn-danger !px-3 !py-1.5 !text-xs"
                            >
                              <XMarkIcon className="h-4 w-4" />
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-xs text-slate-400">Sudah diproses</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={controls.page}
              totalPages={controls.totalPages}
              totalItems={controls.totalItems}
              onPageChange={controls.setPage}
            />
          </>
        )}
      </div>

      {/* Modal penempatan kelompok */}
      <Modal
        open={!!menempatkan}
        onClose={() => setMenempatkan(null)}
        title="Tempatkan Jamaah ke Kelompok"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Pilih kelompok untuk{' '}
          <strong>{menempatkan?.jamaah?.nama_lengkap || menempatkan?.nama_jamaah}</strong>. Jamaah
          akan menerima notifikasi aplikasi dan WhatsApp setelah ditempatkan.
        </p>
        {kelompokTersedia.length === 0 ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            Tidak ada kelompok aktif dengan slot tersedia. Buat kelompok baru terlebih dahulu di
            menu Kelompok Qurban.
          </p>
        ) : (
          <div className="mt-4">
            <label className="label">Kelompok Tujuan</label>
            <select
              className="input"
              value={kelompokTujuan}
              onChange={(e) => setKelompokTujuan(e.target.value)}
            >
              {kelompokTersedia.map((kelompok) => (
                <option key={kelompok.id_kelompok || kelompok._id} value={kelompok.id_kelompok}>
                  Kelompok {kelompok.nomor_kelompok} —{' '}
                  {kelompok.jumlah_anggota ?? kelompok.anggota?.length ?? 0}/7 anggota
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setMenempatkan(null)} disabled={processing}>
            Batal
          </button>
          <button
            className="btn-primary"
            onClick={handleTerima}
            disabled={processing || kelompokTersedia.length === 0}
          >
            {processing && <Spinner className="h-4 w-4 text-white" />}
            Terima & Tempatkan
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!menolak}
        onClose={() => setMenolak(null)}
        onConfirm={handleTolak}
        loading={processing}
        title="Tolak Permintaan"
        message={`Tolak permintaan bergabung dari "${menolak?.jamaah?.nama_lengkap || menolak?.nama_jamaah || 'jamaah ini'}"? Jamaah akan menerima notifikasi penolakan.`}
        confirmLabel="Ya, Tolak"
      />
    </div>
  );
}
