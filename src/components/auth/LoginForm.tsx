import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../stores/authStore';
import { FormInput } from '../ui/FormInput';
import { loginSchema, LoginFormData } from './schemas';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    try {
      await login(data.email, data.password);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {error && (
        <div className="animate-in fade-in rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[10px] font-bold text-red-700">
          {error}
        </div>
      )}

      <FormInput
        label="Email"
        type="email"
        placeholder="your@email.com"
        disabled={isSubmitting}
        error={errors.email}
        {...register('email')}
      />

      <FormInput
        label="Mật Khẩu"
        type="password"
        placeholder="••••••••"
        disabled={isSubmitting}
        error={errors.password}
        {...register('password')}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded-full border border-amber-500 bg-amber-500 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
      </button>
    </form>
  );
};
