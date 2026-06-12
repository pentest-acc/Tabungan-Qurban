import { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import useTableControls from '../../hooks/useTableControls';
import permintaanService from '../../services/permintaanService';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/format';

export default function ValidasiPermintaan() {
  const { data, loading, error, refetch } = useFetch(() => permintaanService.getAll(), []);
  const controls = useTableControls(data, {
    searchFields: ['nama_jamaah', 'id_jamaah', 'nomor_kelompok', 'id_kelompok'],
    filterFn: (item, filter) => {
      const s = String(item.status || '').toLowerCase();
      if (filter === 'pending') return ['pending', 'menunggu', 'menunggu persetujuan'].includes(s);
      return s === filter;
    },
  });

  const [action, setAction] = useState(null); // { type: 'terima'|'tolak', item }
  const [processing, setProcessing] = useState(false);

  const handleAction = async () => {
    setProcessing(true);
    try {
      const id = action.item.id_permintaan || action.item._id;
      if (action.type === 'terima') {
        await permintaanService.terima(id);
        toast.success('Jamaah diterima dan dimasukkan ke detail kelompok');
      } else {
        await permintaanService.tolak(id);
        toast.info('Permintaan bergabung ditolak');
      }
      setAction(null);
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
        subtitle="Terima atau tolak permintaan jamaah untuk bergabung dengan kelompok qurban"
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
                    <th className="table-th">Kelompok Tujuan</th>
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
                        Kelompok {item.kelompok?.nomor_kelompok || item.nomor_kelompok || item.id_kelompok}
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
                              onClick={() => setAction({ type: 'terima', item })}
                              className="btn-primary !px-3 !py-1.5 !text-xs"
                            >
                              <CheckIcon className="h-4 w-4" />
                              Terima
                            </button>
                            <button
                              onClick={() => setAction({ type: 'tolak', item })}
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

      <ConfirmDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        loading={processing}
        danger={action?.type === 'tolak'}
        title={action?.type === 'terima' ? 'Terima Jamaah' : 'Tolak Permintaan'}
        message={
          action?.type === 'terima'
            ? `Terima "${action?.item?.jamaah?.nama_lengkap || action?.item?.nama_jamaah || 'jamaah ini'}" ke dalam kelompok? Kuota kelompok akan diperbarui.`
            : `Tolak permintaan bergabung dari "${action?.item?.jamaah?.nama_lengkap || action?.item?.nama_jamaah || 'jamaah ini'}"?`
        }
        confirmLabel={action?.type === 'terima' ? 'Ya, Terima' : 'Ya, Tolak'}
      />
    </div>
  );
}
