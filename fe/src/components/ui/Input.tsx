import { forwardRef, InputHTMLAttributes } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        {...props}
        className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-sm text-slate-100 transition-all placeholder:text-slate-500 focus:border-amber-500/50 focus:bg-white/[0.08] focus:outline-none ${props.className}`}
      />
    );
  }
);

Input.displayName = 'FormInput';

const Textarea = forwardRef<HTMLTextAreaElement, InputHTMLAttributes<HTMLTextAreaElement>>(
  ({ ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={`custom-scrollbar h-64 w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 text-[15px] font-medium leading-relaxed text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-amber-500/40 focus:bg-white/[0.07] ${props.className}`}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, Input };
