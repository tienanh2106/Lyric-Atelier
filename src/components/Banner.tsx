import React from 'react';

const Banner: React.FC = () => {
  return (
    <div className="animate-in fade-in mx-auto mb-12 w-full max-w-7xl px-6 duration-1000">
      <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl">
        {/* Animated Background Layers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Moving Glows */}
          <div className="absolute -left-1/4 -top-1/2 h-[200%] w-[100%] rotate-12 animate-pulse bg-gradient-to-br from-amber-500/15 via-transparent to-transparent blur-[120px]"></div>
          <div className="absolute -bottom-1/2 -right-1/4 h-[200%] w-[100%] -rotate-12 bg-gradient-to-tl from-amber-500/10 via-transparent to-transparent blur-[120px]"></div>

          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"></div>

          {/* Horizontal Scanline */}
          <div className="absolute inset-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/15 to-transparent opacity-50"></div>
          <div className="absolute inset-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/15 to-transparent opacity-50"></div>
        </div>

        <div className="relative flex flex-col items-center justify-between gap-10 px-12 py-8 md:flex-row">
          {/* Left: Brand Identity */}
          <div className="z-10 flex flex-col items-center space-y-2 md:items-start">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-4 text-3xl font-black uppercase tracking-[-0.04em] text-slate-900 md:text-5xl">
                LYRIC
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,1)]"></span>
                <span className="text-amber-500">ATELIER</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-amber-500/40"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
                Platinum Songwriting Studio
              </p>
            </div>
          </div>

          {/* Center: Studio Philosophy */}
          <div className="hidden max-w-[320px] flex-col items-center border-x border-slate-200 px-10 text-center lg:flex">
            <p className="font-classic text-[11px] italic leading-relaxed text-slate-600 opacity-70">
              "Khai mở tiềm năng ca từ thông qua sự giao thoa của nhạc tính và tư duy thi sỹ."
            </p>
          </div>

          {/* Right: Real-time Status */}
          <div className="z-10 flex items-center gap-8">
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">
                System
              </span>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1">
                <div className="h-1 w-1 animate-pulse rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                  Active
                </span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-200"></div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">
                Mode
              </span>
              <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600">
                  Ultra-Phonetic
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
