import React from 'react';
import { ProTextStyle, ProVFXType } from '../../types/karaokeProTypes';
import { PRO_VFX_LABELS } from '../../constants/karaokeProConstants';

interface Props {
  style: ProTextStyle;
  onUpdate: <K extends keyof ProTextStyle>(key: K, value: ProTextStyle[K]) => void;
}

const VFX_TYPES: ProVFXType[] = [
  'none',
  'stars',
  'snow',
  'fireflies',
  'bubbles',
  'matrix',
  'nebula',
  'aurora',
  'glitch-lines',
  'parallax-stars',
  'geometric-drift',
  'fluid-smoke',
];

export const VFXPanelPro: React.FC<Props> = ({ style, onUpdate }) => (
  <div className="space-y-6 p-4">
    {/* VFX selector */}
    <div>
      <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
        Hiệu Ứng Nền
      </div>
      <div className="grid grid-cols-2 gap-2">
        {VFX_TYPES.map((vfx) => (
          <button
            key={vfx}
            onClick={() => onUpdate('vfxType', vfx)}
            className={`rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${
              style.vfxType === vfx
                ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                : 'border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-violet-500/30 hover:text-slate-200'
            }`}
          >
            {PRO_VFX_LABELS[vfx] ?? vfx}
          </button>
        ))}
      </div>
    </div>

    {/* Density */}
    {style.vfxType !== 'none' && (
      <>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Mật Độ
            </span>
            <span className="font-mono text-[11px] text-slate-400">{style.vfxDensity}</span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            value={style.vfxDensity}
            onChange={(e) => onUpdate('vfxDensity', parseInt(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Tốc Độ
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {style.vfxSpeed.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0.3}
            max={4.0}
            step={0.1}
            value={style.vfxSpeed}
            onChange={(e) => onUpdate('vfxSpeed', parseFloat(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>
      </>
    )}
  </div>
);
