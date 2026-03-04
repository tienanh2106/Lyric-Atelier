import {
  BrainCircuit,
  Languages,
  Music2,
  Layers,
  SlidersHorizontal,
  Zap,
  Mic2,
  VideoIcon,
  Palette,
} from 'lucide-react';

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Trí Tuệ Thi Ca',
    description:
      'Gemini 2.5 Pro hiểu ca từ như hiểu thơ — không phải như đọc dữ liệu. Mỗi câu chữ đều có hồn.',
    accent: 'amber',
  },
  {
    icon: Languages,
    title: 'Không Biên Giới',
    description:
      'Bản nhạc bất kỳ ngôn ngữ nào cũng có thể mang linh hồn tiếng Việt — âm vần giữ nguyên, cảm xúc nhân lên.',
    accent: 'violet',
  },
  {
    icon: Music2,
    title: 'Âm Vận Tự Nhiên',
    description:
      'Ca từ chảy ra như nước, không gượng ép, không vấp nhịp — vì mỗi âm tiết đều được đặt đúng chỗ.',
    accent: 'amber',
  },
  {
    icon: Layers,
    title: 'Bốn Linh Hồn',
    description:
      'V-Pop bùng nổ, Ballad da diết, R&B sâu lắng, hay Indie triết lý — chọn tâm trạng, để AI dệt tiếp.',
    accent: 'violet',
  },
  {
    icon: SlidersHorizontal,
    title: 'Bạn Là Nhạc Sĩ',
    description:
      'Đồng Điệu để giữ hơi thở gốc, Tự Do để phá vỡ mọi khuôn mẫu. Sáng tác theo cách của riêng bạn.',
    accent: 'amber',
  },
  {
    icon: Zap,
    title: 'Cảm Hứng Tức Thì',
    description:
      'Ý tưởng đến lúc nửa đêm? Bản thảo đầu tiên trong 30 giây — trước khi cảm hứng kịp tan đi.',
    accent: 'violet',
  },
  {
    icon: Mic2,
    title: 'Giọng Ca Biến Mất',
    description:
      'Vocal tách ra, giai điệu ở lại nguyên vẹn — nền nhạc sạch, sẵn sàng đón lời ca mới của bạn.',
    accent: 'amber',
  },
  {
    icon: VideoIcon,
    title: 'Ra Thế Giới',
    description:
      'MP4 1080p xuất ngay trên trình duyệt — không cloud, không chờ đợi. Tác phẩm thuộc về bạn.',
    accent: 'violet',
  },
  {
    icon: Palette,
    title: 'Âm Nhạc Có Diện Mạo',
    description:
      'Mười sắc thái VFX và visualizer biến từng khung hình thành nghệ thuật — âm nhạc đáng được nhìn thấy.',
    accent: 'amber',
  },
];

const iconColor = {
  amber: 'text-amber-400 bg-amber-500/10 ring-amber-500/20',
  violet: 'text-violet-400 bg-violet-500/10 ring-violet-500/20',
} as const;

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative bg-[#080910] px-6 py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
            Bên Trong Studio
          </span>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[1.4] tracking-tight text-white">
            Mọi Chi Tiết
            <br />
            <span className="text-slate-500">Đều Có Lý Do</span>
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group flex flex-col gap-4 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-7 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${iconColor[feature.accent]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-[13px] font-black uppercase tracking-wide text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
