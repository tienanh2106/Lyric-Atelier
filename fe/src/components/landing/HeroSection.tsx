import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ALL_ROUTER } from '../../routes';

export const HeroSection = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="animate-in fade-in slide-in-from-bottom-12 flex flex-col items-center gap-12 py-20 text-center delay-75 duration-1000">
      <div className="flex max-w-3xl flex-col gap-6">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/60"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
            AI Songwriting Studio
          </span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/60"></div>
        </div>

        <h1 className="font-classic text-5xl font-bold leading-tight text-white md:text-6xl">
          Viết Lại Lời Bài Hát <br />
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            Với Trí Tuệ Nhân Tạo
          </span>
        </h1>
        <p className="text-base leading-relaxed text-slate-400 md:text-lg">
          Công cụ AI chuyên nghiệp giúp bạn tái tạo lời bài hát với phong cách nghệ sĩ Việt Nam. Đảm
          bảo vần điệu, âm hưởng và cảm xúc trọn vẹn.
        </p>
      </div>

      <Link
        to={isAuthenticated ? ALL_ROUTER.PRIVATE.STUDIO : ALL_ROUTER.PUBLIC.AUTH}
        className="group relative overflow-hidden rounded-full border border-amber-500/80 bg-amber-500 px-12 py-4 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] active:scale-[0.98]"
      >
        <span className="relative z-10">{isAuthenticated ? 'Vào Studio' : 'Bắt Đầu Ngay'}</span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
      </Link>
    </section>
  );
};
