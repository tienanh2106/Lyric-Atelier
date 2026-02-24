import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ALL_ROUTER } from '@/routes';

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSuccess = () => {
    const from = (location.state as any)?.from || ALL_ROUTER.PRIVATE.STUDIO;
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="glass-panel animate-in fade-in slide-in-from-bottom-12 w-full max-w-md overflow-hidden rounded-[3rem] border border-slate-200 duration-700">
        {/* Header with tabs */}
        <div className="border-b border-slate-200 p-8">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-sm font-black uppercase tracking-widest text-slate-900">
              LYRIC
            </span>
            <div className="h-1 w-1 rounded-full bg-amber-500"></div>
            <span className="text-sm font-black uppercase tracking-widest text-slate-900">
              ATELIER
            </span>
          </div>

          {/* Tab Toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đăng Ký
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {activeTab === 'login' ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};
