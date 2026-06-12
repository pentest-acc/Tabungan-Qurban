import Spinner from './Spinner';

export default function LoadingState({ message = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
