import { forwardRef, InputHTMLAttributes } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        {...props}
        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:outline-none ${props.className}`}
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
        className={`custom-scrollbar focus:bg-white" h-64 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-6 text-[15px] font-medium leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-amber-500/50 ${props.className}`}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, Input };
