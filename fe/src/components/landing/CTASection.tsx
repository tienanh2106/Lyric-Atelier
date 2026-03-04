import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ALL_ROUTER } from '../../routes';
import { ArrowRight } from 'lucide-react';

export const CTASection = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="relative overflow-hidden bg-[#080910] px-6 py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <span className="mb-6 inline-block text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
          Sân Khấu Đang Chờ
        </span>
        <h2 className="mb-6 text-[clamp(2.5rem,7vw,5rem)] font-black uppercase leading-[1.4] tracking-[-0.03em] text-white">
          Bài Hát Tiếp Theo
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
            Là Của Bạn
          </span>
        </h2>
        <p className="mb-10 text-base leading-relaxed text-slate-500">
          Mỗi giai điệu đều xứng đáng có lời hay nhất của nó. Đừng để bài hát hay nhất của bạn mãi
          chỉ là ý tưởng chưa thành hình.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to={isAuthenticated ? ALL_ROUTER.PRIVATE.STUDIO : ALL_ROUTER.PUBLIC.AUTH}
            className="group flex items-center gap-3 rounded-full bg-amber-500 px-12 py-4 text-[11px] font-black uppercase tracking-widest text-black shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] active:scale-[0.98]"
          >
            {isAuthenticated ? 'Vào Studio' : 'Bước Vào Studio'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#pricing"
            className="rounded-full border border-white/[0.12] px-12 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-white/[0.2] hover:text-slate-200"
          >
            Xem Bảng Giá
          </a>
        </div>

        {/* Trust bar */}
        <div className="mt-12 flex items-center justify-center gap-6 border-t border-white/[0.05] pt-8">
          {['Chạy ngay trên trình duyệt', 'Dữ liệu của bạn là của bạn', 'Luôn sẵn sàng'].map(
            (item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[10px] font-bold text-slate-600"
              >
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                {item}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};
