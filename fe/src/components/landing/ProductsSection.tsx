import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ALL_ROUTER } from '../../routes';
import {
  ArrowRight,
  Wand2,
  Video,
  Mic,
  Scissors,
  Sparkles,
  Film,
  Zap,
  Timer,
  Layers,
  Music,
  Heart,
  Activity,
} from 'lucide-react';

export const ProductsSection = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section id="products" className="relative overflow-hidden bg-[#080910] px-6 py-32">
      {/* Subtle divider glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />

      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-20 flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
            Công Xưởng
          </span>
          <h2 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[1.4] tracking-tight text-white">
            Mỗi Giai Điệu
            <br />
            <span className="text-slate-500">Một Hành Trình Riêng</span>
          </h2>
          <p className="max-w-xl text-sm text-slate-500">
            Từ ca từ thấm đẫm cảm xúc đến màn hình karaoke cuốn hút — tất cả trong một không gian
            sáng tác duy nhất.
          </p>
        </div>

        {/* Product 1 — AI Lyric Studio */}
        <div className="mb-8 grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[3rem] border border-white/[0.07] bg-white/[0.02] p-12 transition-all hover:border-amber-500/15 lg:grid-cols-2 lg:p-16">
          {/* Left: info */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
                <Wand2 className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-amber-500/70">
                  Công Cụ 01
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  AI Lyric Studio
                </h3>
              </div>
            </div>

            <p className="mb-8 text-[15px] leading-relaxed text-slate-400">
              Không chỉ dịch thuật — là tái sinh. Mỗi câu chữ được dệt lại theo đúng âm vần và thanh
              điệu, giữ nguyên linh hồn giai điệu nhưng mang hơi thở hoàn toàn mới.
            </p>

            <ul className="mb-10 space-y-4">
              {[
                { icon: Mic, text: 'Bốn sắc thái: V-Pop, Ballad, R&B và Indie Triết Lý' },
                { icon: Wand2, text: 'Đồng Điệu hay Tự Do — bạn là nhạc sĩ' },
                { icon: Sparkles, text: 'Gemini 2.5 Pro — mỗi vần thơ đều có linh hồn' },
                { icon: ArrowRight, text: 'Bản thảo đầu tiên trong vòng 30 giây' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[12px] text-slate-400">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <Icon className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <Link
              to={isAuthenticated ? ALL_ROUTER.PRIVATE.STUDIO : ALL_ROUTER.PUBLIC.AUTH}
              className="group inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-7 py-3 text-[10px] font-black uppercase tracking-widest text-amber-400 transition-all hover:bg-amber-500 hover:text-black"
            >
              Vào Studio{' '}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right: Visual mock */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              {/* Studio card mock */}
              <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0d0f1c] p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      AI Output
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-400">
                    Done
                  </span>
                </div>
                {/* Mock lyric lines */}
                <div className="space-y-3">
                  {[
                    { width: 'w-full', highlight: false },
                    { width: 'w-5/6', highlight: true },
                    { width: 'w-full', highlight: false },
                    { width: 'w-4/5', highlight: true },
                    { width: 'w-full', highlight: false },
                    { width: 'w-3/4', highlight: false },
                  ].map((line, i) => (
                    <div
                      key={i}
                      className={`h-2.5 rounded-full ${line.width} ${
                        line.highlight ? 'bg-amber-400/40' : 'bg-white/[0.07]'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2">
                  {['V-Pop', 'Ballad', 'R&B'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/* Glow behind card */}
              <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-amber-500/10 blur-[50px]" />
            </div>
          </div>
        </div>

        {/* Product 2 — Karaoke Studio */}
        <div className="mb-8 grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[3rem] border border-white/[0.07] bg-white/[0.02] p-12 transition-all hover:border-violet-500/15 lg:grid-cols-2 lg:p-16">
          {/* Left: Visual mock */}
          <div className="relative flex items-center justify-center lg:order-first">
            <div className="relative w-full max-w-sm">
              {/* Karaoke card mock */}
              <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0d0f1c] shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                {/* Fake canvas */}
                <div className="relative h-48 overflow-hidden bg-[#050709]">
                  {/* Fake background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-transparent to-amber-900/20" />
                  {/* Fake visualizer bars */}
                  <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-end gap-1">
                    {[14, 24, 18, 34, 28, 40, 22, 32, 18, 26, 16, 30].map((h, i) => (
                      <div
                        key={i}
                        className="w-2 rounded-sm bg-amber-400/60"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                  {/* Fake lyric text */}
                  <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1">
                    {['Em', 'ơi', 'đừng', 'khóc'].map((word, i) => (
                      <span
                        key={i}
                        className={`text-sm font-black uppercase ${
                          i < 2 ? 'text-amber-400' : 'text-white/40'
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                  {/* Fake VFX dots */}
                  {[
                    { top: '20%', left: '15%' },
                    { top: '60%', left: '80%' },
                    { top: '30%', left: '70%' },
                    { top: '70%', left: '25%' },
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute h-1.5 w-1.5 rounded-full bg-violet-400/60 shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                      style={pos}
                    />
                  ))}
                </div>
                {/* Player controls mock */}
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500">
                    <div className="ml-0.5 h-0 w-0 border-b-[5px] border-l-[8px] border-t-[5px] border-b-transparent border-l-black border-t-transparent" />
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 w-full rounded-full bg-white/[0.07]">
                      <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-amber-600 to-amber-400" />
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">02:14</span>
                </div>
              </div>
              {/* Glow behind card */}
              <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-violet-500/10 blur-[50px]" />
            </div>
          </div>

          {/* Right: info */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/20">
                <Video className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-violet-400/70">
                  Công Cụ 02
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Karaoke Studio
                </h3>
              </div>
            </div>

            <p className="mb-8 text-[15px] leading-relaxed text-slate-400">
              Âm nhạc đáng được nhìn thấy. Từng từ sáng đúng khoảnh khắc, từng khung hình kể một câu
              chuyện — rồi export ra thế giới chỉ bằng một cú click.
            </p>

            <ul className="mb-10 space-y-4">
              {[
                { icon: Mic, text: 'Giọng ca biến mất, giai điệu ở lại' },
                { icon: Scissors, text: 'Từng chữ khắc đúng khoảnh khắc của nó' },
                { icon: Sparkles, text: 'Mười cách để âm nhạc trở nên visual' },
                { icon: Film, text: 'MP4 sẵn sàng trong tích tắc — không cần cloud' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[12px] text-slate-400">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                    <Icon className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <Link
              to={isAuthenticated ? ALL_ROUTER.PRIVATE.KARAOKE_STUDIO : ALL_ROUTER.PUBLIC.AUTH}
              className="group inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-7 py-3 text-[10px] font-black uppercase tracking-widest text-violet-400 transition-all hover:bg-violet-500 hover:text-white"
            >
              Mở Karaoke Studio{' '}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Product 3 — Karaoke Pro */}
        <div className="mt-8 grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[3rem] border border-white/[0.07] bg-white/[0.02] p-12 transition-all hover:border-fuchsia-500/15 lg:grid-cols-2 lg:p-16">
          {/* Left: info */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/10 ring-1 ring-fuchsia-500/20">
                <Layers className="h-6 w-6 text-fuchsia-400" />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400/70">
                  Công Cụ 03
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Karaoke Pro
                </h3>
              </div>
            </div>

            <p className="mb-8 text-[15px] leading-relaxed text-slate-400">
              Chỉnh từng từ, từng mili-giây — sự hoàn hảo nằm trong chi tiết. 12 VFX độc quyền,
              background filters, tách vocal ngay trên trình duyệt, không cần server.
            </p>

            <ul className="mb-10 space-y-4">
              {[
                { icon: Zap, text: '12 VFX: Matrix, Aurora, Nebula, Glitch và nhiều hơn' },
                { icon: Timer, text: 'Chỉnh từng từ ±50ms — timing chuẩn đến tuyệt đối' },
                { icon: Scissors, text: 'Tách vocal miễn phí — Web Audio API phase cancellation' },
                {
                  icon: Sparkles,
                  text: 'Background filters: brightness, contrast, blur real-time',
                },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[12px] text-slate-400">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10">
                    <Icon className="h-3.5 w-3.5 text-fuchsia-400" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <Link
              to={isAuthenticated ? ALL_ROUTER.PRIVATE.KARAOKE_PRO : ALL_ROUTER.PUBLIC.AUTH}
              className="group inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-7 py-3 text-[10px] font-black uppercase tracking-widest text-fuchsia-400 transition-all hover:bg-fuchsia-500 hover:text-white"
            >
              Mở Karaoke Pro{' '}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right: Visual mock */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0d0f1c] shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                {/* Fake canvas */}
                <div className="relative h-48 overflow-hidden bg-[#050709]">
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/30 via-transparent to-violet-900/20" />
                  {/* Fake matrix chars */}
                  {[10, 30, 55, 80, 105, 130, 155, 180, 205].map((x, i) => (
                    <div
                      key={i}
                      className="absolute top-0 font-mono text-[11px] font-bold text-green-400/50"
                      style={{ left: x, animationDelay: `${i * 0.15}s` }}
                    >
                      {['0', '1', 'ア', 'カ', '二'][i % 5]}
                    </div>
                  ))}
                  {/* Fake aurora bands */}
                  <div className="absolute left-0 right-0 top-8 h-6 rounded-full bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent blur-sm" />
                  <div className="absolute left-0 right-0 top-16 h-4 rounded-full bg-gradient-to-r from-transparent via-violet-500/15 to-transparent blur-sm" />
                  {/* Fake lyric */}
                  <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1">
                    {['Từng', 'từ', 'sáng', 'đúng', 'nhịp'].map((word, i) => (
                      <span
                        key={i}
                        className={`text-sm font-black ${i < 3 ? 'text-fuchsia-400' : 'text-white/30'}`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Word timing mock */}
                <div className="space-y-1.5 p-4">
                  {['Từng', 'từ', 'sáng'].map((word, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-12 text-[10px] font-bold text-fuchsia-400">{word}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-fuchsia-500/60"
                          style={{ width: `${60 + i * 15}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-slate-600">
                        {(1.2 + i * 0.4).toFixed(1)}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-[50px]" />
            </div>
          </div>
        </div>

        {/* Product 4 — Neon Pulse */}
        <div className="mt-8 grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[3rem] border border-white/[0.07] bg-white/[0.02] p-12 transition-all hover:border-cyan-500/15 lg:grid-cols-2 lg:p-16">
          {/* Left: Visual mock */}
          <div className="relative flex items-center justify-center lg:order-first">
            <div className="relative w-full max-w-sm">
              <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-black shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                {/* Fake canvas */}
                <div className="relative h-56 overflow-hidden bg-black">
                  {/* Fake BG gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-transparent to-purple-900/30" />
                  {/* Fake star field */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-0.5 w-0.5 rounded-full bg-white/60"
                      style={{ top: `${(i * 37) % 90}%`, left: `${(i * 53) % 95}%` }}
                    />
                  ))}
                  {/* Fake heartbeat visualizer */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                      <Heart className="h-10 w-10 text-cyan-400 opacity-80" />
                    </div>
                  </div>
                  {/* Fake laser lines */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    {[0, 45, 90, 135].map((deg, i) => (
                      <div
                        key={i}
                        className="absolute h-32 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
                        style={{ transform: `rotate(${deg}deg)` }}
                      />
                    ))}
                  </div>
                  {/* Fake title */}
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                      NEON HORIZON
                    </p>
                    <p className="mt-0.5 text-[8px] tracking-widest text-cyan-400/70">
                      OFFICIAL AUDIO
                    </p>
                  </div>
                </div>
                {/* Player mock */}
                <div className="flex items-center gap-3 bg-black/40 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500">
                    <div className="ml-0.5 h-0 w-0 border-b-[5px] border-l-[8px] border-t-[5px] border-b-transparent border-l-black border-t-transparent" />
                  </div>
                  <div className="flex-1">
                    <div className="h-1 w-full rounded-full bg-white/10">
                      <div className="h-full w-1/3 rounded-full bg-cyan-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded border border-red-500/50 bg-red-500/10 px-2 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-[9px] font-bold text-red-400">REC</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-cyan-500/10 blur-[50px]" />
            </div>
          </div>

          {/* Right: info */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <Activity className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-cyan-400/70">
                  Công Cụ 04
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Neon Pulse
                </h3>
              </div>
            </div>

            <p className="mb-8 text-[15px] leading-relaxed text-slate-400">
              Âm nhạc sống động như thị giác. 7 bộ visualizer phản ứng theo từng nhịp bass — từ trái
              tim đập đến đường hầm neon — ghi lại trực tiếp thành WebM.
            </p>

            <ul className="mb-10 space-y-4">
              {[
                {
                  icon: Heart,
                  text: '7 Visualizer: Heartbeat, Laser, Tunnel, Equalizer và nhiều hơn',
                },
                { icon: Music, text: 'Phân tích bass real-time — hiệu ứng phản ứng từng nhịp đập' },
                {
                  icon: Sparkles,
                  text: 'Fireflies, Shooting Stars, Radial Burst — hiệu ứng phụ đa dạng',
                },
                { icon: Zap, text: 'AI Theme Generator — 1 click ra màu sắc + tiêu đề' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[12px] text-slate-400">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                    <Icon className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <Link
              to={isAuthenticated ? ALL_ROUTER.PRIVATE.NEON_PULSE : ALL_ROUTER.PUBLIC.AUTH}
              className="group inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-7 py-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition-all hover:bg-cyan-500 hover:text-black"
            >
              Mở Neon Pulse{' '}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
