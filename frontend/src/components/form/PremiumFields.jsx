import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Field premium untuk halaman publik (login/register).
// Kompatibel penuh dengan register() react-hook-form lewat forwardRef —
// murni perubahan tampilan, tanpa mengubah perilaku form.

function FieldError({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className="mt-1.5 text-xs font-medium text-red-500"
        >
          {error.message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const baseInput =
  'w-full rounded-xl border bg-white/70 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm backdrop-blur transition-all duration-200 focus:outline-none focus:ring-4 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500';

const stateClass = (error) =>
  error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/60'
    : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-primary-500/10 dark:border-slate-700 dark:hover:border-slate-600 dark:focus:border-primary-500';

export const PremiumInput = forwardRef(function PremiumInput(
  { label, icon: Icon, error, type = 'text', className = '', ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
        )}
        <input
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          className={`${baseInput} ${stateClass(error)} ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
      </div>
      <FieldError error={error} />
    </div>
  );
});

export const PremiumTextarea = forwardRef(function PremiumTextarea(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={`${baseInput} ${stateClass(error)} px-4`}
        {...props}
      />
      <FieldError error={error} />
    </div>
  );
});
