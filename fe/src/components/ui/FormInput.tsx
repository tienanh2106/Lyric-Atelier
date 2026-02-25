import { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-[9px] font-black uppercase tracking-widest text-amber-500">
          {label}
        </label>
        <input
          ref={ref}
          type={type}
          className={`w-full rounded-xl border bg-white/[0.06] px-4 py-3 text-sm text-slate-100 transition-all placeholder:text-slate-500 focus:bg-white/[0.08] focus:outline-none ${
            error
              ? 'border-red-500/40 focus:border-red-500'
              : 'border-white/[0.08] focus:border-amber-500/50'
          }`}
          {...props}
        />
        {error && <span className="text-[10px] font-bold text-red-400">{error.message}</span>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
