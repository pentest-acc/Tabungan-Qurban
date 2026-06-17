import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Avatar from '../../components/ui/Avatar';
import EditorProfilMedia from '../../components/profil/EditorProfilMedia';
import { ROLE_LABELS } from '../../utils/format';

// Halaman profil untuk admin biasa & kepala admin. Berfokus pada media profil
// (foto/GIF/video + border beranimasi) yang berlaku untuk semua peran.
export default function ProfilAdmin() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Profil Saya" subtitle="Kelola foto & border profil akun Anda" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center p-6 text-center">
          <Avatar
            src={user?.foto_profil}
            tipe={user?.tipe_media}
            border={user?.border_profil}
            nama={user?.nama_lengkap || user?.username}
            size={104}
            cropScale={user?.crop_scale}
            cropX={user?.crop_x}
            cropY={user?.crop_y}
          />
          <h2 className="mt-3 text-lg font-bold">{user?.nama_lengkap || user?.username}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</p>
          <span className="mt-3 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {ROLE_LABELS[user?.role] || 'Admin'}
          </span>
        </div>

        <div className="lg:col-span-2">
          <EditorProfilMedia />
        </div>
      </div>
    </div>
  );
}
