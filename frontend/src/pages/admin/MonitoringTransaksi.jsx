import { BanknotesIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import useTableControls from '../../hooks/useTableControls';
import transaksiService from '../../services/transaksiService';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import StatCard from '../../components/ui/StatCard';
import Badge, { statusVariant } from '../../components/ui/Badge';
import { formatRupiah, formatDateTime } from '../../utils/format';

export default function MonitoringTransaksi() {
  const { data, loading, error, refetch } = useFetch(() => transaksiService.getAll(), []);
  const controls = useTableControls(data, {
    searchFields: ['id_transaksi', 'nama_jamaah', 'id_jamaah', 'metode_bayar'],
    filterFn: (item, filter) => String(item.jenis_transaksi || '').toLowerCase() === filter,
    pageSize: 10,
  });

  const allList = Array.isArray(data) ? data : data?.data ?? [];
  const totalDana = allList.reduce((sum, trx) => sum + (Number(trx.total_bayar) || 0), 0);

  return (
    <div>
      <PageHeader
        title="Monitoring Transaksi"
        subtitle="Pantau seluruh pembayaran tabungan qurban dari jamaah"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard icon={ClipboardDocumentListIcon} label="Total Transaksi" value={allList.length} accent="bg-blue-500" />
        <StatCard icon={BanknotesIcon} label="Total Dana Masuk" value={formatRupiah(totalDana)} />
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800">
          <SearchInput
            value={controls.search}
            onChange={controls.setSearch}
            placeholder="Cari ID transaksi / jamaah..."
          />
          <select
            className="input sm:max-w-[180px]"
            value={controls.filter}
            onChange={(e) => controls.setFilter(e.target.value)}
          >
            <option value="">Semua Jenis</option>
            <option value="tunai">Tunai</option>
            <option value="cicil">Cicil</option>
          </select>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : controls.pageItems.length === 0 ? (
          <EmptyState title="Belum Ada Transaksi" message="Transaksi pembayaran jamaah akan tampil di sini." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="table-th">ID Transaksi</th>
                    <th className="table-th">Jamaah</th>
                    <th className="table-th">Tanggal</th>
                    <th className="table-th">Jumlah</th>
                    <th className="table-th">Metode</th>
                    <th className="table-th">Jenis</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {controls.pageItems.map((trx) => (
                    <tr key={trx.id_transaksi || trx._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="table-td font-mono text-xs">{trx.id_transaksi || trx._id}</td>
                      <td className="table-td font-medium">
                        {trx.jamaah?.nama_lengkap || trx.nama_jamaah || trx.id_jamaah || '-'}
                      </td>
                      <td className="table-td">{formatDateTime(trx.tanggal_bayar)}</td>
                      <td className="table-td font-semibold">{formatRupiah(trx.total_bayar)}</td>
                      <td className="table-td">{trx.metode_bayar || '-'}</td>
                      <td className="table-td">
                        <Badge variant={statusVariant(trx.jenis_transaksi)}>{trx.jenis_transaksi || '-'}</Badge>
                      </td>
                      <td className="table-td">
                        <Badge variant={statusVariant(trx.status_pembayaran)}>
                          {trx.status_pembayaran || '-'}
                        </Badge>
                      </td>
                      <td className="table-td">
                        {trx.bukti_pembayaran ? (
                          <a
                            href={trx.bukti_pembayaran}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            Lihat
                          </a>
                        ) : (
                          '-'
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
    </div>
  );
}
