import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ProTextStyle } from '../../types/karaokeProTypes';

interface Props {
  style: ProTextStyle;
  onUpdate: <K extends keyof ProTextStyle>(key: K, value: ProTextStyle[K]) => void;
  onReset: () => void;
}

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        <span className="font-mono text-[11px] text-slate-400">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-violet-500"
      />
    </div>
  );
}

export const BackgroundFiltersPanelPro: React.FC<Props> = ({ style, onUpdate, onReset }) => (
  <div className="space-y-5 p-4">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Background Filters</span>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 transition-all hover:border-violet-500/30 hover:text-violet-400"
      >
        <RotateCcw className="h-3 w-3" /> Reset
      </button>
    </div>

    <SliderRow label="Brightness" value={style.bgBrightness} min={30} max={200} unit="%" onChange={(v) => onUpdate('bgBrightness', v)} />
    <SliderRow label="Contrast" value={style.bgContrast} min={30} max={200} unit="%" onChange={(v) => onUpdate('bgContrast', v)} />
    <SliderRow label="Saturation" value={style.bgSaturation} min={0} max={300} unit="%" onChange={(v) => onUpdate('bgSaturation', v)} />
    <SliderRow label="Blur" value={style.bgBlur} min={0} max={30} step={0.5} unit="px" onChange={(v) => onUpdate('bgBlur', v)} />
    <SliderRow label="Overlay Opacity" value={style.bgOverlayOpacity} min={0} max={100} unit="%" onChange={(v) => onUpdate('bgOverlayOpacity', v)} />

    {/* Preview swatch */}
    <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
      <div
        className="h-16 w-full bg-gradient-to-br from-violet-600 via-slate-700 to-amber-600"
        style={{
          filter: `brightness(${style.bgBrightness}%) contrast(${style.bgContrast}%) saturate(${style.bgSaturation}%) blur(${style.bgBlur}px)`,
        }}
      />
      <div className="px-3 py-2 text-[10px] text-slate-600">Preview filter</div>
    </div>
  </div>
);
