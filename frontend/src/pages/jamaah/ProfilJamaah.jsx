import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import jamaahService from '../../services/jamaahService';
import PageHeader from '../../components/ui/PageHeader';
import { Input, Textarea } from '../../components/form/Fields';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import EditorProfilMedia from '../../components/profil/EditorProfilMedia';
import { ROLE_LABELS } from '../../utils/format';

export default function ProfilJamaah() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nama_lengkap: user?.nama_lengkap || '',
      username: user?.username || '',
      no_telp: user?.no_telp || '',
      alamat: user?.alamat || '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values };
      if (!payload.password) delete payload.password;
      await jamaahService.updateProfil(payload);
      updateUser({
        nama_lengkap: payload.nama_lengkap,
        username: payload.username,
        no_telp: payload.no_telp,
        alamat: payload.alamat,
      });
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profil Saya" subtitle="Kelola informasi akun jamaah Anda" />

      <EditorProfilMedia />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center p-6 text-center">
          <Avatar
            src={user?.foto_profil}
            tipe={user?.tipe_media}
            border={user?.border_profil}
            nama={user?.nama_lengkap || user?.username}
            size={104}
          />
          <h2 className="mt-3 text-lg font-bold">{user?.nama_lengkap || user?.username}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</p>
          <span className="mt-3 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {ROLE_LABELS[user?.role] || 'Jamaah'}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 lg:col-span-2" noValidate>
          <h2 className="mb-4 font-semibold">Ubah Data Diri</h2>
          <div className="space-y-4">
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
            <Textarea label="Alamat" error={errors.alamat} {...register('alamat')} />
            <Input
              label="Password Baru (kosongkan jika tidak diubah)"
              type="password"
              autoComplete="new-password"
              error={errors.password}
              {...register('password', {
                validate: (v) => !v || v.length >= 6 || 'Minimal 6 karakter',
              })}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Spinner className="h-4 w-4 text-white" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
