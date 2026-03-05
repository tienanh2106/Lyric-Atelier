import React from 'react';
import { ProTextStyle, ProAnimationType } from '../../types/karaokeProTypes';
import { PRO_ANIMATION_LABELS } from '../../constants/karaokeProConstants';

interface Props {
  style: ProTextStyle;
  onUpdate: <K extends keyof ProTextStyle>(key: K, value: ProTextStyle[K]) => void;
}

const ANIMATIONS: ProAnimationType[] = [
  'classic', 'smooth', 'neon-glow', 'fill-step',
  'rhythmic-pulse', 'zoom', 'bounce', 'rainbow',
];

const VISUALIZER_OPTIONS = [
  { value: 'none', label: 'Không có' },
  { value: 'ethereal-flow', label: 'Ethereal Flow' },
  { value: 'prism-spectrum', label: 'Prism Spectrum' },
] as const;

export const AnimationPanelPro: React.FC<Props> = ({ style, onUpdate }) => (
  <div className="space-y-6 p-4">
    {/* Word Animation */}
    <div>
      <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
        Hiệu Ứng Chữ
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ANIMATIONS.map((anim) => (
          <button
            key={anim}
            onClick={() => onUpdate('wordAnimation', anim)}
            className={`rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${
              style.wordAnimation === anim
                ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                : 'border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-violet-500/30 hover:text-slate-200'
            }`}
          >
            {PRO_ANIMATION_LABELS[anim]}
          </button>
        ))}
      </div>
    </div>

    {/* Visualizer */}
    <div>
      <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
        Visualizer
      </div>
      <div className="space-y-2">
        {VISUALIZER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onUpdate('visualizerType', opt.value as ProTextStyle['visualizerType'])}
            className={`w-full rounded-xl px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider transition-all ${
              style.visualizerType === opt.value
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40'
                : 'border border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);
