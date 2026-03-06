import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { ALL_ROUTER } from '@/routes';

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useAuthStore((state) => state.logout);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#080910]/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to={ALL_ROUTER.PUBLIC.HOME} className="flex items-center gap-2">
          <span className="text-sm font-black uppercase tracking-widest text-white">MELOD</span>
          <span className="text-sm font-black uppercase tracking-widest text-amber-400">AI</span>
        </Link>

        {/* Navigation & Auth */}
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-6">
            <Link
              to={ALL_ROUTER.PUBLIC.HOME}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-amber-400"
            >
              Trang Chủ
            </Link>
            {isAuthenticated && (
              <Link
                to={ALL_ROUTER.PRIVATE.STUDIO}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-amber-400"
              >
                Studio
              </Link>
            )}
            {/* {isAuthenticated && (
              <Link
                to={ALL_ROUTER.PRIVATE.KARAOKE_STUDIO}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-amber-400"
              >
                Karaoke
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to={ALL_ROUTER.PRIVATE.KARAOKE_PRO}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-violet-400"
              >
                Karaoke Pro
              </Link>
            )} */}
            {/* {isAuthenticated && (
              <Link
                to={ALL_ROUTER.PRIVATE.NEON_PULSE}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-violet-400"
              >
                Neon Pulse
              </Link>
            )} */}
          </nav>

          {isInitialized ? (
            isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-2 transition-all hover:border-amber-500/30 hover:bg-amber-500/10"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {user.email}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="shadow-3xl absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0f1c]">
                      <div className="border-b border-white/[0.06] px-4 py-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                          Đã đăng nhập
                        </p>
                        <p className="mt-1 truncate text-[11px] font-bold text-slate-100">
                          {user.email}
                        </p>
                        {user.fullName && (
                          <p className="text-[10px] text-slate-400">{user.fullName}</p>
                        )}
                      </div>
                      <Link
                        to={ALL_ROUTER.PRIVATE.ACCOUNT}
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                      >
                        Tài Khoản
                      </Link>
                      <Link
                        to={ALL_ROUTER.PRIVATE.STUDIO}
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                      >
                        Studio
                      </Link>
                      <Link
                        to={ALL_ROUTER.PRIVATE.KARAOKE_STUDIO}
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-amber-500/10 hover:text-amber-400"
                      >
                        Karaoke Studio
                      </Link>
                      <Link
                        to={ALL_ROUTER.PRIVATE.KARAOKE_PRO}
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-violet-500/10 hover:text-violet-400"
                      >
                        Karaoke Pro
                      </Link>
                      <Link
                        to={ALL_ROUTER.PRIVATE.NEON_PULSE}
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400"
                      >
                        Neon Pulse
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        Đăng Xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to={ALL_ROUTER.PUBLIC.AUTH}
                className="rounded-full border border-amber-500 bg-amber-500 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-[0.98]"
              >
                Đăng Nhập
              </Link>
            )
          ) : (
            <div className="h-10 w-24 animate-pulse rounded-full bg-white/[0.08]"></div>
          )}
        </div>
      </div>
    </header>
  );
};
