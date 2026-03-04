import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ALL_ROUTER } from '../../routes';
import { ArrowRight, ChevronDown } from 'lucide-react';

export const HeroSection = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-8 text-center">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.06] blur-[150px]" />
        <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/[0.07] blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/[0.05] blur-[110px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/10 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Badge */}
        <div className="flex items-center gap-2.5 rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-5 py-2 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">
            Platinum Songwriting Studio
          </span>
        </div>

        {/* Headline */}
        <div className="max-w-5xl">
          <h1 className="text-[clamp(3.5rem,10vw,7.5rem)] font-black uppercase leading-[1.4] tracking-[-0.04em] text-white">
            Nơi Ca Từ
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-300 bg-clip-text text-transparent">
              Chạm Đến
            </span>
            <br />
            Giai Điệu
          </h1>
        </div>

        {/* Subtext */}
        <p className="max-w-xl text-[clamp(0.875rem,1.5vw,1.125rem)] leading-relaxed text-slate-400">
          Mỗi giai điệu đều xứng đáng có lời hay nhất của nó. Melodai giúp bạn tìm ra những ca từ đó
          — rồi đưa chúng lên màn hình.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to={isAuthenticated ? ALL_ROUTER.PRIVATE.STUDIO : ALL_ROUTER.PUBLIC.AUTH}
            className="group flex items-center gap-3 rounded-full bg-amber-500 px-10 py-4 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.03] hover:bg-amber-400 hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] active:scale-[0.98]"
          >
            {isAuthenticated ? 'Mở Studio' : 'Bắt Đầu Sáng Tác'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#products"
            className="flex items-center gap-3 rounded-full border border-white/[0.14] bg-white/[0.04] px-10 py-4 text-[11px] font-black uppercase tracking-widest text-slate-300 backdrop-blur-sm transition-all hover:border-white/[0.24] hover:bg-white/[0.08]"
          >
            Xem Sản Phẩm
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-6 flex items-center gap-8 border-t border-white/[0.07] pt-8 sm:gap-12">
          {[
            { value: '2', label: 'Công xưởng sáng tác' },
            { value: '10+', label: 'Sắc thái âm nhạc' },
            { value: '1080p', label: 'Độ sắc nét xuất video' },
            { value: '30s', label: 'Đến bản thảo đầu tiên' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xl font-black text-amber-400 md:text-2xl">{stat.value}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-1.5 opacity-40">
        <ChevronDown className="h-5 w-5 text-slate-500" />
      </div>
    </section>
  );
};
