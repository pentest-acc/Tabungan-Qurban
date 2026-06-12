import { InboxIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ title = 'Belum Ada Data', message = 'Data akan tampil di sini.', action = null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
        <InboxIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {action}
    </div>
  );
}
