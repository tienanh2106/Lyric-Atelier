import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ALL_ROUTER } from '../../routes';
import { Upload, Cpu, Download } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Upload,
    title: 'Đưa Vào Studio',
    description:
      'Nạp bản nhạc và lời vào không gian sáng tác. Studio tự đọc hiểu cả âm thanh lẫn ngôn ngữ — ngay cả khi bạn chưa có lời.',
    accent: 'amber',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Phép Màu Bắt Đầu',
    description:
      'Gemini 2.5 Pro lắng nghe từng nhịp phách, cảm nhận cảm xúc và dệt nên ca từ khớp hoàn hảo với linh hồn giai điệu.',
    accent: 'violet',
  },
  {
    number: '03',
    icon: Download,
    title: 'Ra Thế Giới',
    description:
      'Ca từ hoặc video karaoke 1080p — tác phẩm của bạn sẵn sàng được nghe, được thấy và được chia sẻ.',
    accent: 'emerald',
  },
] as const;

const accentStyles = {
  amber: {
    icon: 'bg-amber-500/10 ring-amber-500/20 text-amber-400',
    number: 'text-amber-500/20',
    line: 'bg-gradient-to-r from-amber-500/30 to-transparent',
  },
  violet: {
    icon: 'bg-violet-500/10 ring-violet-500/20 text-violet-400',
    number: 'text-violet-500/20',
    line: 'bg-gradient-to-r from-violet-500/30 to-transparent',
  },
  emerald: {
    icon: 'bg-emerald-500/10 ring-emerald-500/20 text-emerald-400',
    number: 'text-emerald-500/20',
    line: '',
  },
} as const;

export const HowItWorksSection = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="relative bg-[#06080f] px-6 py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-20 flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
            Hành Trình
          </span>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[1.4] tracking-tight text-white">
            Từ Ý Tưởng
            <br />
            <span className="text-slate-500">Đến Tác Phẩm</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-emerald-500/10 md:block" />

          {STEPS.map((step) => {
            const styles = accentStyles[step.accent];
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col gap-5 rounded-[2.5rem] border border-white/[0.06] bg-white/[0.02] p-8 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                {/* Step number (background) */}
                <div
                  className={`absolute right-8 top-6 text-7xl font-black leading-none ${styles.number}`}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${styles.icon}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-slate-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            to={isAuthenticated ? ALL_ROUTER.PRIVATE.STUDIO : ALL_ROUTER.PUBLIC.AUTH}
            className="group inline-flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.06] px-10 py-4 text-[11px] font-black uppercase tracking-widest text-slate-300 transition-all hover:border-white/[0.18] hover:bg-white/[0.1]"
          >
            Bắt Đầu Hành Trình
          </Link>
        </div>
      </div>
    </section>
  );
};
