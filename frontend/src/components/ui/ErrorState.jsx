import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ErrorState({ message = 'Terjadi kesalahan saat memuat data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <p className="font-medium text-slate-700 dark:text-slate-200">Gagal Memuat Data</p>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-2">
          <ArrowPathIcon className="h-4 w-4" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
