import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import useTableControls from '../../hooks/useTableControls';
import sapiService from '../../services/sapiService';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import { Input } from '../../components/form/Fields';
import { formatRupiah } from '../../utils/format';

const DEFAULT_HARGA_SAPI = 23800000;
const DEFAULT_HARGA_PORSI = 3400000;

export default function DataSapi() {
  const { data, loading, error, refetch } = useFetch(() => sapiService.getAll(), []);
  const controls = useTableControls(data, { searchFields: ['id_sapi', 'penanda_sapi'] });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const openCreate = () => {
    setEditing(null);
    reset({
      penanda_sapi: '',
      bobot_estimasi: '',
      harga_sapi: DEFAULT_HARGA_SAPI,
      harga_porsi: DEFAULT_HARGA_PORSI,
    });
    setModalOpen(true);
  };

  const openEdit = (sapi) => {
    setEditing(sapi);
    reset({
      penanda_sapi: sapi.penanda_sapi,
      bobot_estimasi: sapi.bobot_estimasi,
      harga_sapi: sapi.harga_sapi,
      harga_porsi: sapi.harga_porsi,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        bobot_estimasi: Number(values.bobot_estimasi),
        harga_sapi: Number(values.harga_sapi),
        harga_porsi: Number(values.harga_porsi),
      };
      if (editing) {
        await sapiService.update(editing.id_sapi || editing._id, payload);
        toast.success('Data sapi berhasil diperbarui');
      } else {
        await sapiService.create(payload);
        toast.success('Sapi qurban berhasil ditambahkan');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setSaving(true);
    try {
      await sapiService.remove(deleting.id_sapi || deleting._id);
      toast.success('Data sapi berhasil dihapus');
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Data Sapi Qurban"
        subtitle="Kelola katalog sapi yang ditawarkan kepada kelompok"
        actions={
          <button onClick={openCreate} className="btn-primary">
            <PlusIcon className="h-5 w-5" />
            Tambah Sapi
          </button>
        }
      />

      <div className="card">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <SearchInput
            value={controls.search}
            onChange={controls.setSearch}
            placeholder="Cari penanda sapi..."
          />
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : controls.pageItems.length === 0 ? (
          <EmptyState title="Belum Ada Sapi" message="Tambahkan data sapi qurban baru." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="table-th">ID</th>
                    <th className="table-th">Penanda Sapi</th>
                    <th className="table-th">Bobot Estimasi</th>
                    <th className="table-th">Harga Sapi</th>
                    <th className="table-th">Harga / Porsi</th>
                    <th className="table-th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {controls.pageItems.map((sapi) => (
                    <tr key={sapi.id_sapi || sapi._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="table-td font-mono text-xs">{sapi.id_sapi || sapi._id}</td>
                      <td className="table-td font-medium">{sapi.penanda_sapi}</td>
                      <td className="table-td">{sapi.bobot_estimasi} kg</td>
                      <td className="table-td font-semibold">{formatRupiah(sapi.harga_sapi)}</td>
                      <td className="table-td">{formatRupiah(sapi.harga_porsi)}</td>
                      <td className="table-td">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(sapi)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleting(sapi)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                            title="Hapus"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Sapi Qurban' : 'Tambah Sapi Qurban'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Penanda Sapi"
            placeholder="Contoh: Sapi Limosin A-01"
            error={errors.penanda_sapi}
            {...register('penanda_sapi', { required: 'Penanda sapi wajib diisi' })}
          />
          <Input
            label="Bobot Estimasi (kg)"
            type="number"
            step="0.01"
            placeholder="Contoh: 450.50"
            error={errors.bobot_estimasi}
            {...register('bobot_estimasi', {
              required: 'Bobot estimasi wajib diisi',
              min: { value: 1, message: 'Bobot tidak valid' },
            })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Harga Sapi Total (Rp)"
              type="number"
              error={errors.harga_sapi}
              {...register('harga_sapi', {
                required: 'Harga sapi wajib diisi',
                min: { value: 1, message: 'Harga tidak valid' },
              })}
            />
            <Input
              label="Harga per Porsi (Rp)"
              type="number"
              error={errors.harga_porsi}
              {...register('harga_porsi', {
                required: 'Harga porsi wajib diisi',
                min: { value: 1, message: 'Harga tidak valid' },
              })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4 text-white" />}
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={onDelete}
        loading={saving}
        title="Hapus Data Sapi"
        message={`Yakin ingin menghapus "${deleting?.penanda_sapi}"?`}
        confirmLabel="Ya, Hapus"
      />
    </div>
  );
}
