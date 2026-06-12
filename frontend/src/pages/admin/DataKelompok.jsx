import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import useTableControls from '../../hooks/useTableControls';
import kelompokService from '../../services/kelompokService';
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
import Badge, { statusVariant } from '../../components/ui/Badge';
import { Input, Select } from '../../components/form/Fields';
import { formatDate } from '../../utils/format';

export default function DataKelompok() {
  const { data, loading, error, refetch } = useFetch(() => kelompokService.getAll(), []);
  const sapiFetch = useFetch(() => sapiService.getAll(), []);
  const controls = useTableControls(data, {
    searchFields: ['id_kelompok', 'nomor_kelompok', 'status'],
    filterFn: (item, filter) => String(item.status || '').toLowerCase() === filter,
  });

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

  const sapiList = Array.isArray(sapiFetch.data) ? sapiFetch.data : sapiFetch.data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    reset({ nomor_kelompok: '', id_sapi: '', tanggal_mulai: '', tanggal_berakhir: '', status: 'Aktif' });
    setModalOpen(true);
  };

  const openEdit = (kelompok) => {
    setEditing(kelompok);
    reset({
      nomor_kelompok: kelompok.nomor_kelompok,
      id_sapi: kelompok.id_sapi || kelompok.sapi?.id_sapi || '',
      tanggal_mulai: kelompok.tanggal_mulai?.slice(0, 10) || '',
      tanggal_berakhir: kelompok.tanggal_berakhir?.slice(0, 10) || '',
      status: kelompok.status || 'Aktif',
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await kelompokService.update(editing.id_kelompok || editing._id, values);
        toast.success('Kelompok berhasil diperbarui');
      } else {
        // Backend otomatis membuat Tabungan_Qurban saat kelompok dibuat (relasi 1:1)
        await kelompokService.create(values);
        toast.success('Kelompok baru berhasil dibuat beserta tabungannya');
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
      await kelompokService.remove(deleting.id_kelompok || deleting._id);
      toast.success('Kelompok dibubarkan beserta tabungan terkait');
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
        title="Kelompok Qurban"
        subtitle="Bentuk kelompok baru dan atur periodenya — tabungan kelompok dibuat otomatis"
        actions={
          <button onClick={openCreate} className="btn-primary">
            <PlusIcon className="h-5 w-5" />
            Buat Kelompok
          </button>
        }
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800">
          <SearchInput
            value={controls.search}
            onChange={controls.setSearch}
            placeholder="Cari nomor kelompok..."
          />
          <select
            className="input sm:max-w-[180px]"
            value={controls.filter}
            onChange={(e) => controls.setFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="penuh">Penuh</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : controls.pageItems.length === 0 ? (
          <EmptyState title="Belum Ada Kelompok" message="Buat kelompok qurban baru." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="table-th">Nomor</th>
                    <th className="table-th">Sapi</th>
                    <th className="table-th">Periode</th>
                    <th className="table-th">Anggota</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {controls.pageItems.map((kelompok) => (
                    <tr key={kelompok.id_kelompok || kelompok._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="table-td font-medium">
                        Kelompok {kelompok.nomor_kelompok || kelompok.id_kelompok}
                      </td>
                      <td className="table-td">
                        {kelompok.sapi?.penanda_sapi || kelompok.id_sapi || '-'}
                      </td>
                      <td className="table-td">
                        {formatDate(kelompok.tanggal_mulai)} — {formatDate(kelompok.tanggal_berakhir)}
                      </td>
                      <td className="table-td">
                        {kelompok.jumlah_anggota ?? kelompok.anggota?.length ?? 0}/7
                      </td>
                      <td className="table-td">
                        <Badge variant={statusVariant(kelompok.status)}>{kelompok.status || '-'}</Badge>
                      </td>
                      <td className="table-td">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(kelompok)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleting(kelompok)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                            title="Bubarkan"
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
        title={editing ? 'Edit Kelompok' : 'Buat Kelompok Baru'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Nomor Kelompok"
            placeholder="Contoh: 01"
            error={errors.nomor_kelompok}
            {...register('nomor_kelompok', { required: 'Nomor kelompok wajib diisi' })}
          />
          <Select
            label="Pilih Sapi Qurban"
            error={errors.id_sapi}
            {...register('id_sapi', { required: 'Sapi wajib dipilih' })}
          >
            <option value="">-- Pilih Sapi --</option>
            {sapiList.map((sapi) => (
              <option key={sapi.id_sapi || sapi._id} value={sapi.id_sapi || sapi._id}>
                {sapi.penanda_sapi} ({sapi.bobot_estimasi} kg)
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Tanggal Mulai"
              type="date"
              error={errors.tanggal_mulai}
              {...register('tanggal_mulai', { required: 'Tanggal mulai wajib diisi' })}
            />
            <Input
              label="Tanggal Berakhir"
              type="date"
              error={errors.tanggal_berakhir}
              {...register('tanggal_berakhir', {
                required: 'Tanggal berakhir wajib diisi',
                validate: (value, formValues) =>
                  !formValues.tanggal_mulai ||
                  value > formValues.tanggal_mulai ||
                  'Harus setelah tanggal mulai',
              })}
            />
          </div>
          <Select label="Status" {...register('status')}>
            <option value="Aktif">Aktif</option>
            <option value="Penuh">Penuh</option>
            <option value="Expired">Expired</option>
          </Select>
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
        title="Bubarkan Kelompok"
        message={`Yakin ingin membubarkan Kelompok ${deleting?.nomor_kelompok}? Tabungan terkait juga akan dihapus.`}
        confirmLabel="Ya, Bubarkan"
      />
    </div>
  );
}
