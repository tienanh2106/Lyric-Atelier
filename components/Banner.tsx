
import React from 'react';

const Banner: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto mb-12 animate-in fade-in duration-1000 px-6">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] group shadow-2xl">
        
        {/* Animated Background Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Moving Glows */}
          <div className="absolute -top-1/2 -left-1/4 w-[100%] h-[200%] bg-gradient-to-br from-amber-500/10 via-transparent to-transparent rotate-12 blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-[100%] h-[200%] bg-gradient-to-tl from-amber-500/5 via-transparent to-transparent -rotate-12 blur-[120px]"></div>
          
          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"></div>
          
          {/* Horizontal Scanline */}
          <div className="absolute inset-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent top-0 opacity-50"></div>
          <div className="absolute inset-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent bottom-0 opacity-50"></div>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 py-8 px-12">
          
          {/* Left: Brand Identity */}
          <div className="flex flex-col items-center md:items-start space-y-2 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-5xl font-black tracking-[-0.04em] text-white uppercase flex items-center gap-4">
                LYRIC 
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,1)]"></span>
                <span className="text-amber-500">ATELIER</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-amber-500/40"></div>
              <p className="text-slate-500 text-[10px] font-black tracking-[0.5em] uppercase">
                Platinum Songwriting Studio
              </p>
            </div>
          </div>

          {/* Center: Studio Philosophy */}
          <div className="hidden lg:flex flex-col items-center text-center px-10 border-x border-white/5 max-w-[320px]">
            <p className="text-slate-400 text-[11px] font-classic italic leading-relaxed opacity-60">
              "Khai mở tiềm năng ca từ thông qua sự giao thoa của nhạc tính và tư duy thi sỹ."
            </p>
          </div>

          {/* Right: Real-time Status */}
          <div className="flex items-center gap-8 z-10">
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">System</span>
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
              </div>
            </div>
            
            <div className="w-[1px] h-10 bg-white/5"></div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Mode</span>
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/5 border border-amber-500/10">
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Ultra-Phonetic</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Banner;
