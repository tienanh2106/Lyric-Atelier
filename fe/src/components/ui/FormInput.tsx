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
          className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none ${
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-slate-200 focus:border-amber-500/50'
          }`}
          {...props}
        />
        {error && <span className="text-[10px] font-bold text-red-600">{error.message}</span>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
