export default function StatCard({ icon: Icon, label, value, accent = 'bg-primary-600' }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent} text-white`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
