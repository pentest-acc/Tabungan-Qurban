import { forwardRef } from 'react';

// Komponen field yang kompatibel dengan register() milik react-hook-form.

export const Input = forwardRef(function Input({ label, error, ...props }, ref) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input ref={ref} className="input" {...props} />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select({ label, error, children, ...props }, ref) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select ref={ref} className="input" {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, ...props }, ref) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea ref={ref} className="input" rows={3} {...props} />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
});
