import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import useTableControls from '../../hooks/useTableControls';
import adminService from '../../services/adminService';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/form/Fields';
import { ROLE_LABELS } from '../../utils/format';

export default function KelolaAdmin() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch(() => adminService.getAll(), []);
  const controls = useTableControls(data, {
    searchFields: ['id_admin', 'username', 'nama_lengkap'],
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
    reset({ username: '', password: '', nama_lengkap: '' });
    setModalOpen(true);
  };

  const openEdit = (admin) => {
    setEditing(admin);
    reset({ username: admin.username, password: '', nama_lengkap: admin.nama_lengkap });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, role: 'admin_biasa' };
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        await adminService.update(editing.id_admin || editing._id, payload);
        toast.success('Data admin berhasil diperbarui');
      } else {
        await adminService.create(payload);
        toast.success('Admin biasa berhasil didaftarkan');
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
      await adminService.remove(deleting.id_admin || deleting._id);
      toast.success('Akun admin berhasil dihapus');
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
        title="Kelola Admin Biasa"
        subtitle="Daftarkan dan kelola akun admin biasa"
        actions={
          <button onClick={openCreate} className="btn-primary">
            <PlusIcon className="h-5 w-5" />
            Tambah Admin
          </button>
        }
      />

      <div className="card">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <SearchInput
            value={controls.search}
            onChange={controls.setSearch}
            placeholder="Cari nama / username admin..."
          />
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : controls.pageItems.length === 0 ? (
          <EmptyState title="Belum Ada Admin" message="Tambahkan akun admin biasa baru." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="table-th">ID</th>
                    <th className="table-th">Nama Lengkap</th>
                    <th className="table-th">Username</th>
                    <th className="table-th">Role</th>
                    <th className="table-th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {controls.pageItems.map((admin) => {
                    const isSelf =
                      (admin.id_admin || admin._id) === (user?.id_admin || user?._id || user?.id);
                    return (
                      <tr key={admin.id_admin || admin._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="table-td font-mono text-xs">{admin.id_admin || admin._id}</td>
                        <td className="table-td font-medium">{admin.nama_lengkap}</td>
                        <td className="table-td">@{admin.username}</td>
                        <td className="table-td">
                          <Badge variant={admin.role === 'kepala_admin' ? 'blue' : 'gray'}>
                            {ROLE_LABELS[admin.role] || admin.role}
                          </Badge>
                        </td>
                        <td className="table-td">
                          {admin.role !== 'kepala_admin' && !isSelf ? (
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => openEdit(admin)}
                                className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                title="Edit"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setDeleting(admin)}
                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Hapus"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-right text-xs text-slate-400">-</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
        title={editing ? 'Edit Admin Biasa' : 'Tambah Admin Biasa'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Nama Lengkap"
            error={errors.nama_lengkap}
            {...register('nama_lengkap', { required: 'Nama lengkap wajib diisi' })}
          />
          <Input
            label="Username"
            error={errors.username}
            {...register('username', { required: 'Username wajib diisi' })}
          />
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
        title="Hapus Akun Admin"
        message={`Yakin ingin menghapus akun admin "${deleting?.nama_lengkap}"?`}
        confirmLabel="Ya, Hapus"
      />
    </div>
  );
}
