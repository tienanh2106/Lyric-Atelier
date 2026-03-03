import React from 'react';
import { TextStyle } from '../../types/karaoke';
import { FONTS } from '../../constants/karaoke';

interface TypographyPanelProps {
  style: TextStyle;
  onUpdate: (key: keyof TextStyle, value: unknown) => void;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({ style, onUpdate }) => {
  return (
    <div className="animate-fadeIn space-y-10">
      <div className="space-y-5">
        <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          Hiệu ứng chạy chữ
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'classic', label: 'Cổ điển' },
            { id: 'basic-ktv', label: 'Basic Karaoke' },
            { id: 'neon-pulse', label: 'Neon Soft' },
            { id: 'float-up', label: 'Mềm mại' },
            { id: 'glitch', label: 'Digital' },
            { id: 'wave-distort', label: 'Gợn sóng' },
            { id: 'fire-glow', label: 'Hỏa rực rỡ' },
            { id: 'smoke-rise', label: 'Làn khói' },
            { id: 'rainbow-sweep', label: 'Cầu vồng' },
            { id: 'blur-reveal', label: 'Hiện mờ' },
            { id: 'zoom-bounce', label: 'Phóng to' },
          ].map((anim) => (
            <button
              key={anim.id}
              onClick={() => onUpdate('textAnimation', anim.id as TextStyle['textAnimation'])}
              className={`flex items-center justify-center rounded-2xl border px-4 py-4 text-center text-[10px] font-black uppercase transition-all ${
                style.textAnimation === anim.id
                  ? 'border-amber-400 bg-amber-500 text-black shadow-xl shadow-amber-500/20'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>

      {style.textAnimation === 'basic-ktv' && (
        <div className="animate-fadeIn space-y-5">
          <div className="flex items-center gap-3 border-l-4 border-amber-500/60 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Tùy chọn Basic KTV
          </div>
          <div className="glass-panel grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] p-5">
            <button
              onClick={() => onUpdate('ktvFillType', 'flat')}
              className={`rounded-xl border py-3 text-[9px] font-black uppercase transition-all ${
                style.ktvFillType === 'flat'
                  ? 'border-amber-400 bg-amber-500 text-black'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
              }`}
            >
              Màu đơn (Flat)
            </button>
            <button
              onClick={() => onUpdate('ktvFillType', 'rainbow')}
              className={`rounded-xl border py-3 text-[9px] font-black uppercase transition-all ${
                style.ktvFillType === 'rainbow'
                  ? 'border-white/10 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
              }`}
            >
              Cầu vồng
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          Phông chữ & Bố cục
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FONTS.map((f) => (
            <button
              key={f}
              onClick={() => onUpdate('fontFamily', f)}
              style={{ fontFamily: f }}
              className={`rounded-2xl border py-4 text-xs transition-all ${
                style.fontFamily === f
                  ? 'border-amber-400 bg-amber-500 text-black shadow-xl'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel space-y-8 rounded-[2.5rem] border border-white/[0.08] p-8">
        <div className="space-y-5">
          <div className="mb-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Đường Viền (Stroke)
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500">
                <span>ĐỘ DÀY</span>
                <span>{style.strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={style.strokeWidth}
                onChange={(e) => onUpdate('strokeWidth', parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500">
                <span>MÀU VIỀN</span>
              </div>
              <input
                type="color"
                className="h-8 w-full cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-transparent"
                value={style.strokeColor}
                onChange={(e) => onUpdate('strokeColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="mb-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Đổ Bóng (Shadow)
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500">
                <span>ĐỘ NHÒE</span>
                <span>{style.shadowBlur}</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={style.shadowBlur}
                onChange={(e) => onUpdate('shadowBlur', parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500">
                <span>MÀU BÓNG</span>
              </div>
              <input
                type="color"
                className="h-8 w-full cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-transparent"
                value={style.shadowColor}
                onChange={(e) => onUpdate('shadowColor', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500">
                <span>LỆCH X</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                value={style.shadowOffsetX}
                onChange={(e) => onUpdate('shadowOffsetX', parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-slate-500">
                <span>LỆCH Y</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                value={style.shadowOffsetY}
                onChange={(e) => onUpdate('shadowOffsetY', parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel space-y-8 rounded-[2.5rem] border border-white/[0.08] p-8">
        <div className="space-y-4">
          <div className="flex justify-between text-[9px] font-black text-slate-400">
            <span>VỊ TRÍ DỌC (Y-AXIS)</span>
            <span className="text-amber-500">{style.positionY}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="95"
            value={style.positionY}
            onChange={(e) => onUpdate('positionY', parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-[9px] font-black text-slate-400">
            <span>CỠ CHỮ (FONT SIZE)</span>
            <span className="text-amber-500">{style.fontSize}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="150"
            value={style.fontSize}
            onChange={(e) => onUpdate('fontSize', parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
