import React from 'react';
import { Image as ImageIcon, Music, Brush, Upload } from 'lucide-react';
import { TextStyle } from '../../types/karaoke';

interface AppearancePanelProps {
  style: TextStyle;
  logoFile: File | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'audio' | 'logo') => void;
  onUpdate: (key: keyof TextStyle, value: unknown) => void;
}

export const AppearancePanel: React.FC<AppearancePanelProps> = ({
  style,
  logoFile,
  onFileUpload,
  onUpdate,
}) => {
  return (
    <div className="animate-fadeIn space-y-10">
      <div className="space-y-5">
        <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <ImageIcon className="h-4 w-4" /> Logo & Nhận diện
        </label>
        <div className="glass-panel space-y-8 rounded-[2.5rem] border border-white/[0.08] p-8">
          <div className="space-y-4">
            <label className="px-1 text-[8px] font-black uppercase text-slate-500">
              Intro Editor
            </label>
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-xs text-white outline-none focus:border-amber-500"
              placeholder="Tên bài hát..."
              value={style.introTitle}
              onChange={(e) => onUpdate('introTitle', e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-xs text-white outline-none focus:border-amber-500"
              placeholder="Ca sĩ..."
              value={style.introArtist}
              onChange={(e) => onUpdate('introArtist', e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="px-1 text-[8px] font-black uppercase text-slate-500">
              Tải Logo Mới
            </label>
            <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.03] p-4 transition-all hover:border-amber-500">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileUpload(e, 'logo')}
                className="hidden"
              />
              <Upload className="h-4 w-4 text-slate-500 group-hover:text-amber-500" />
              <span className="truncate text-[10px] font-black text-slate-400 group-hover:text-white">
                {logoFile ? logoFile.name : 'Thay đổi Logo'}
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-[9px] font-black text-slate-400">
              <span>KÍCH THƯỚC LOGO</span>
              <span className="text-amber-500">{style.logoSize}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="300"
              value={style.logoSize}
              onChange={(e) => onUpdate('logoSize', parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => onUpdate('logoPosition', pos)}
                className={`rounded-xl border py-3 text-[9px] font-black uppercase transition-all ${
                  style.logoPosition === pos
                    ? 'border-amber-400 bg-amber-500 text-black'
                    : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Music className="h-4 w-4" /> Hiệu ứng Nền
        </label>
        <div className="glass-panel space-y-6 rounded-[2.5rem] border border-white/[0.08] p-8">
          <div className="space-y-4">
            <div className="flex justify-between text-[9px] font-black text-slate-400">
              <span>CƯỜNG ĐỘ NHỊP ĐIỆU (PULSE)</span>
              <span className="text-amber-500">{style.bgPulseIntensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={style.bgPulseIntensity}
              onChange={(e) => onUpdate('bgPulseIntensity', parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Brush className="h-4 w-4" /> Bảng màu KTV
        </label>
        <div className="glass-panel grid grid-cols-2 gap-5 rounded-[2.5rem] border border-white/[0.08] p-8">
          <div className="space-y-3">
            <label className="block text-center text-[8px] font-black uppercase text-slate-500">
              Chờ Hát
            </label>
            <div className="group relative">
              <input
                type="color"
                className="absolute inset-0 z-10 h-16 w-full cursor-pointer bg-transparent opacity-0"
                value={style.initialColor}
                onChange={(e) => onUpdate('initialColor', e.target.value)}
              />
              <div
                className="h-16 w-full rounded-2xl border-2 border-white/10 shadow-inner transition-all group-hover:border-amber-500"
                style={{ backgroundColor: style.initialColor }}
              ></div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-center text-[8px] font-black uppercase text-slate-500">
              Khi Hát
            </label>
            <div className="group relative">
              <input
                type="color"
                className="absolute inset-0 z-10 h-16 w-full cursor-pointer bg-transparent opacity-0"
                value={style.activeColor}
                onChange={(e) => onUpdate('activeColor', e.target.value)}
              />
              <div
                className="h-16 w-full rounded-2xl border-2 border-white/10 shadow-inner transition-all group-hover:border-amber-500"
                style={{ backgroundColor: style.activeColor }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
