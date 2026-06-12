import { Link } from 'react-router-dom';
import { UserGroupIcon, CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import useTableControls from '../../hooks/useTableControls';
import kelompokService from '../../services/kelompokService';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatRupiah, formatDate } from '../../utils/format';

export default function DaftarKelompok() {
  const { data, loading, error, refetch } = useFetch(() => kelompokService.getAll(), []);
  const controls = useTableControls(data, {
    searchFields: ['nomor_kelompok', 'id_kelompok', 'status'],
    filterFn: (item, filter) => String(item.status || '').toLowerCase() === filter,
    pageSize: 9,
  });

  return (
    <div>
      <PageHeader
        title="Kelompok Qurban"
        subtitle="Pilih kelompok aktif dan ajukan permintaan bergabung"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <div className="card">
          <EmptyState
            title="Tidak Ada Kelompok"
            message="Belum ada kelompok qurban yang sesuai pencarian Anda."
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {controls.pageItems.map((kelompok) => {
              const id = kelompok.id_kelompok || kelompok._id;
              const anggota = kelompok.jumlah_anggota ?? kelompok.anggota?.length ?? 0;
              return (
                <div key={id} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
                      <UserGroupIcon className="h-6 w-6" />
                    </div>
                    <Badge variant={statusVariant(kelompok.status)}>{kelompok.status || '-'}</Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">
                    Kelompok {kelompok.nomor_kelompok || id}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {anggota}/7 anggota terdaftar
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                      {formatDate(kelompok.tanggal_mulai)} — {formatDate(kelompok.tanggal_berakhir)}
                    </p>
                    <p className="font-semibold text-primary-600">
                      {formatRupiah(kelompok.sapi?.harga_porsi ?? kelompok.harga_porsi ?? 3400000)} / porsi
                    </p>
                  </div>
                  <Link
                    to={`/jamaah/kelompok/${id}`}
                    className="btn-secondary mt-4 w-full"
                  >
                    Lihat Detail
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="card mt-4">
            <Pagination
              page={controls.page}
              totalPages={controls.totalPages}
              totalItems={controls.totalItems}
              onPageChange={controls.setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
