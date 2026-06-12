import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import useTableControls from '../../hooks/useTableControls';
import jamaahService from '../../services/jamaahService';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import { Input, Textarea } from '../../components/form/Fields';

export default function DataJamaah() {
  const { data, loading, error, refetch } = useFetch(() => jamaahService.getAll(), []);
  const controls = useTableControls(data, {
    searchFields: ['id_jamaah', 'username', 'nama_lengkap', 'no_telp'],
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

  const openCreate = () => {
    setEditing(null);
    reset({ username: '', password: '', nama_lengkap: '', no_telp: '', alamat: '' });
    setModalOpen(true);
  };

  const openEdit = (jamaah) => {
    setEditing(jamaah);
    reset({
      username: jamaah.username,
      password: '',
      nama_lengkap: jamaah.nama_lengkap,
      no_telp: jamaah.no_telp,
      alamat: jamaah.alamat || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values };
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        await jamaahService.update(editing.id_jamaah || editing._id, payload);
        toast.success('Data jamaah berhasil diperbarui');
      } else {
        await jamaahService.create(payload);
        toast.success('Jamaah baru berhasil didaftarkan');
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
      await jamaahService.remove(deleting.id_jamaah || deleting._id);
      toast.success('Akun jamaah berhasil dihapus');
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
        title="Data Jamaah"
        subtitle="Kelola akun jamaah, termasuk mendaftarkan jamaah yang kesulitan membuat akun"
        actions={
          <button onClick={openCreate} className="btn-primary">
            <PlusIcon className="h-5 w-5" />
            Tambah Jamaah
          </button>
        }
      />

      <div className="card">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <SearchInput
            value={controls.search}
            onChange={controls.setSearch}
            placeholder="Cari nama, username, no. telp..."
          />
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : controls.pageItems.length === 0 ? (
          <EmptyState
            title="Belum Ada Jamaah"
            message="Tambahkan jamaah baru dengan tombol di atas."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="table-th">ID</th>
                    <th className="table-th">Nama Lengkap</th>
                    <th className="table-th">Username</th>
                    <th className="table-th">No. Telp</th>
                    <th className="table-th">Alamat</th>
                    <th className="table-th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {controls.pageItems.map((jamaah) => (
                    <tr key={jamaah.id_jamaah || jamaah._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="table-td font-mono text-xs">{jamaah.id_jamaah || jamaah._id}</td>
                      <td className="table-td font-medium">{jamaah.nama_lengkap}</td>
                      <td className="table-td">@{jamaah.username}</td>
                      <td className="table-td">{jamaah.no_telp}</td>
                      <td className="table-td max-w-[200px] truncate">{jamaah.alamat || '-'}</td>
                      <td className="table-td">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(jamaah)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleting(jamaah)}
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

      {/* Modal tambah/edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Jamaah' : 'Tambah Jamaah'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Nama Lengkap"
            error={errors.nama_lengkap}
            {...register('nama_lengkap', { required: 'Nama lengkap wajib diisi' })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Username"
              error={errors.username}
              {...register('username', { required: 'Username wajib diisi' })}
            />
            <Input
              label="No. Telepon"
              error={errors.no_telp}
              {...register('no_telp', { required: 'No. telepon wajib diisi' })}
            />
          </div>
          <Input
            label={editing ? 'Password Baru (kosongkan jika tetap)' : 'Password'}
            type="password"
            autoComplete="new-password"
            error={errors.password}
            {...register('password', {
              validate: (v) => {
                if (!editing && !v) return 'Password wajib diisi';
                if (v && v.length < 6) return 'Minimal 6 karakter';
                return true;
              },
            })}
          />
          <Textarea label="Alamat (opsional)" {...register('alamat')} />
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
        title="Hapus Akun Jamaah"
        message={`Yakin ingin menghapus akun "${deleting?.nama_lengkap}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
      />
    </div>
  );
}
