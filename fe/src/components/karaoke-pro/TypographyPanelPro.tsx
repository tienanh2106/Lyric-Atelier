import React from 'react';
import { ProTextStyle } from '../../types/karaokeProTypes';
import { PRO_FONTS } from '../../constants/karaokeProConstants';

interface Props {
  style: ProTextStyle;
  onUpdate: <K extends keyof ProTextStyle>(key: K, value: ProTextStyle[K]) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <span className="font-mono text-[11px] text-slate-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-violet-500"
      />
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
      />
    </div>
  );
}

export const TypographyPanelPro: React.FC<Props> = ({ style, onUpdate }) => (
  <div className="space-y-5 p-4">
    {/* Font */}
    <div>
      <div className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
        Font
      </div>
      <select
        value={style.fontFamily}
        onChange={(e) => onUpdate('fontFamily', e.target.value)}
        className="w-full rounded-xl border border-white/[0.08] bg-[#0d0f1c] px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/40"
      >
        {PRO_FONTS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>

    <SliderRow
      label="Cỡ chữ (px)"
      value={style.fontSize}
      min={20}
      max={120}
      onChange={(v) => onUpdate('fontSize', v)}
    />
    <SliderRow
      label="Letter Spacing"
      value={style.letterSpacing}
      min={-2}
      max={20}
      step={0.5}
      onChange={(v) => onUpdate('letterSpacing', v)}
    />
    <SliderRow
      label="Line Gap"
      value={style.lineGap}
      min={20}
      max={300}
      onChange={(v) => onUpdate('lineGap', v)}
    />
    <SliderRow
      label="Side Margin"
      value={style.sideMargin}
      min={0}
      max={400}
      onChange={(v) => onUpdate('sideMargin', v)}
    />
    <SliderRow
      label="Vị trí dọc (%)"
      value={style.positionY}
      min={10}
      max={95}
      onChange={(v) => onUpdate('positionY', v)}
    />
    <SliderRow
      label="Shadow Blur"
      value={style.shadowBlur}
      min={0}
      max={80}
      onChange={(v) => onUpdate('shadowBlur', v)}
    />
    <SliderRow
      label="Glow Intensity"
      value={style.glowIntensity}
      min={0}
      max={60}
      onChange={(v) => onUpdate('glowIntensity', v)}
    />
    <SliderRow
      label="Stroke Width"
      value={style.strokeWidth}
      min={0}
      max={8}
      step={0.5}
      onChange={(v) => onUpdate('strokeWidth', v)}
    />

    <div className="space-y-3">
      <ColorRow
        label="Màu chữ"
        value={style.initialColor}
        onChange={(v) => onUpdate('initialColor', v)}
      />
      <ColorRow
        label="Màu active"
        value={style.activeColor}
        onChange={(v) => onUpdate('activeColor', v)}
      />
      <ColorRow
        label="Màu stroke"
        value={style.strokeColor}
        onChange={(v) => onUpdate('strokeColor', v)}
      />
      <ColorRow
        label="Màu shadow"
        value={style.shadowColor}
        onChange={(v) => onUpdate('shadowColor', v)}
      />
    </div>

    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        All Caps
      </span>
      <button
        onClick={() => onUpdate('allCaps', !style.allCaps)}
        className={`relative h-6 w-11 rounded-full transition-colors ${style.allCaps ? 'bg-violet-500' : 'bg-white/10'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${style.allCaps ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  </div>
);
