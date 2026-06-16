import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ScaleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import kelompokService from '../../services/kelompokService';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Avatar from '../../components/ui/Avatar';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatRupiah, formatDate } from '../../utils/format';

export default function DetailKelompok() {
  const { id } = useParams();
  const [anggotaDipilih, setAnggotaDipilih] = useState(null);
  const { data, loading, error, refetch } = useFetch(() => kelompokService.getById(id), [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const kelompok = data?.data ?? data;
  if (!kelompok) {
    return <EmptyState title="Kelompok Tidak Ditemukan" message="Data kelompok tidak tersedia." />;
  }

  const sapi = kelompok.sapi ?? {};
  const anggota = kelompok.anggota ?? [];
  const tabungan = kelompok.tabungan ?? {};
  const hargaSapi = sapi.harga_sapi ?? 23800000;
  const totalTerkumpul = tabungan.total_terkumpul ?? 0;
  const progress = hargaSapi > 0 ? Math.min(100, Math.round((totalTerkumpul / hargaSapi) * 100)) : 0;

  return (
    <div>
      <Link
        to="/jamaah/kelompok"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke Daftar Kelompok
      </Link>

      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Kelompok {kelompok.nomor_kelompok || kelompok.id_kelompok}
              </h1>
              <Badge variant={statusVariant(kelompok.status)}>{kelompok.status || '-'}</Badge>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarDaysIcon className="h-4 w-4" />
              Periode: {formatDate(kelompok.tanggal_mulai)} — {formatDate(kelompok.tanggal_berakhir)}
            </p>
          </div>
        </div>

        {/* Progress tabungan kelompok */}
        <div className="mt-6">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Progres Tabungan Kelompok</span>
            <span className="font-semibold text-primary-600">{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatRupiah(totalTerkumpul)} dari target {formatRupiah(hargaSapi)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Info sapi */}
        <div className="card p-6">
          <h2 className="mb-4 font-semibold">Informasi Sapi Qurban</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ScaleIcon className="h-4 w-4" /> Penanda Sapi
              </dt>
              <dd className="font-medium">{sapi.penanda_sapi || '-'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Bobot Estimasi</dt>
              <dd className="font-medium">{sapi.bobot_estimasi ? `${sapi.bobot_estimasi} kg` : '-'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <BanknotesIcon className="h-4 w-4" /> Harga Sapi
              </dt>
              <dd className="font-semibold">{formatRupiah(hargaSapi)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Harga per Porsi</dt>
              <dd className="font-semibold text-primary-600">
                {formatRupiah(sapi.harga_porsi ?? 3400000)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Anggota */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <UserGroupIcon className="h-5 w-5" />
            Anggota Kelompok ({anggota.length}/7)
          </h2>
          {anggota.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Belum ada anggota yang bergabung.
            </p>
          ) : (
            <ul className="space-y-2">
              {anggota.map((member, idx) => (
                <li key={member.id_detail || member.id_jamaah || idx}>
                  <button
                    onClick={() => setAnggotaDipilih(member)}
                    className="flex w-full items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-left transition-colors hover:bg-primary-50 dark:bg-slate-800/60 dark:hover:bg-primary-900/30"
                    title="Lihat profil anggota"
                  >
                    <Avatar
                      src={member.foto_profil}
                      tipe={member.tipe_media}
                      border={member.border_profil}
                      nama={member.nama_lengkap || member.jamaah?.nama_lengkap || member.id_jamaah}
                      size={44}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {member.nama_lengkap || member.jamaah?.nama_lengkap || member.id_jamaah}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">#{idx + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-400">Klik anggota untuk melihat profilnya.</p>
        </div>
      </div>

      {/* Profil publik anggota — informasi sensitif (no. telp, alamat) tidak ditampilkan */}
      <Modal
        open={!!anggotaDipilih}
        onClose={() => setAnggotaDipilih(null)}
        title="Profil Anggota"
        maxWidth="max-w-sm"
      >
        {anggotaDipilih && (
          <div className="flex flex-col items-center text-center">
            <Avatar
              src={anggotaDipilih.foto_profil}
              tipe={anggotaDipilih.tipe_media}
              border={anggotaDipilih.border_profil}
              nama={anggotaDipilih.nama_lengkap || anggotaDipilih.jamaah?.nama_lengkap}
              size={104}
            />
            <h3 className="mt-3 text-lg font-bold">
              {anggotaDipilih.nama_lengkap || anggotaDipilih.jamaah?.nama_lengkap}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              @{anggotaDipilih.jamaah?.username || '-'}
            </p>
            <dl className="mt-4 w-full space-y-2 rounded-lg bg-slate-50 p-4 text-left text-sm dark:bg-slate-800/60">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Kelompok</dt>
                <dd className="font-medium">
                  Kelompok {kelompok.nomor_kelompok || kelompok.id_kelompok}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Bergabung sejak</dt>
                <dd className="font-medium">
                  {formatDate(anggotaDipilih.bergabung_sejak || anggotaDipilih.createdAt)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-400">
              Demi privasi, informasi pribadi seperti nomor telepon dan alamat tidak ditampilkan.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
