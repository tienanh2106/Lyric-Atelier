import React from 'react';
import {
  Activity,
  Layout,
  Sparkles,
  Ghost,
  Music,
  Disc,
  Heart,
  Star,
  Droplets,
  Palette,
  CloudRain,
  Wind,
} from 'lucide-react';
import { TextStyle } from '../../types/karaoke';

interface VFXPanelProps {
  style: TextStyle;
  onUpdate: (key: keyof TextStyle, value: unknown) => void;
}

export const VFXPanel: React.FC<VFXPanelProps> = ({ style, onUpdate }) => {
  return (
    <div className="animate-fadeIn space-y-10">
      <div className="space-y-5">
        <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Activity className="h-4 w-4" /> Biểu tượng Studio
        </label>
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { id: 'none', label: 'TẮT', icon: Ghost },
            { id: 'equalizer', label: 'SÓNG EQ', icon: Activity },
            { id: 'note', label: 'NỐT NHẠC', icon: Music },
            { id: 'vinyl', label: 'ĐĨA THAN', icon: Disc },
            { id: 'heart', label: 'TRÁI TIM', icon: Heart },
            { id: 'star', label: 'NGÔI SAO', icon: Star },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onUpdate('iconType', item.id as TextStyle['iconType'])}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border py-5 text-[9px] font-black uppercase transition-all ${
                style.iconType === item.id
                  ? 'border-amber-400 bg-amber-500 text-black shadow-2xl shadow-amber-500/30'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${style.iconType === item.id ? 'animate-bounce' : ''}`}
              />
              {item.label}
            </button>
          ))}
        </div>
        {style.iconType !== 'none' && (
          <div className="glass-panel space-y-8 rounded-[2.5rem] border border-white/[0.08] p-8">
            <div className="space-y-4">
              <div className="flex justify-between text-[9px] font-black text-slate-400">
                <span>KÍCH THƯỚC</span>
                <span className="text-amber-500">{style.iconSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                value={style.iconSize}
                onChange={(e) => onUpdate('iconSize', parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between text-[9px] font-black text-slate-400">
                  <span>VỊ TRÍ X</span>
                  <span className="text-amber-500">{style.iconPosX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={style.iconPosX}
                  onChange={(e) => onUpdate('iconPosX', parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[9px] font-black text-slate-400">
                  <span>VỊ TRÍ Y</span>
                  <span className="text-amber-500">{style.iconPosY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={style.iconPosY}
                  onChange={(e) => onUpdate('iconPosY', parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[9px] font-black text-slate-400">
                <span>ĐỘ TRONG SUỐT</span>
                <span className="text-amber-500">{Math.round(style.iconOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={style.iconOpacity}
                onChange={(e) => onUpdate('iconOpacity', parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Layout className="h-4 w-4" /> Sóng nhạc Spectrum
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'none', label: 'TẮT' },
            { id: 'bars', label: 'CỘT SÓNG' },
            { id: 'mirror', label: 'ĐỐI XỨNG' },
            { id: 'circle', label: 'BAO QUANH' },
            { id: 'radial', label: 'TỎA TRÒN' },
          ].map((vis) => (
            <button
              key={vis.id}
              onClick={() => onUpdate('visualizerType', vis.id as TextStyle['visualizerType'])}
              className={`rounded-2xl border py-5 text-[10px] font-black uppercase transition-all ${
                style.visualizerType === vis.id
                  ? 'border-amber-400 bg-amber-500 text-black shadow-xl'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
              }`}
            >
              {vis.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Sparkles className="h-4 w-4" /> Hiệu ứng môi trường (VFX)
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'none', label: 'VÔ HIỆU', icon: Ghost },
            { id: 'stars', label: 'NGÔI SAO', icon: Star },
            { id: 'snow', label: 'TUYẾT', icon: Droplets },
            { id: 'bokeh', label: 'BOKEH', icon: Palette },
            { id: 'rain', label: 'MƯA RƠI', icon: CloudRain },
            { id: 'fireflies', label: 'ĐOM ĐÓM', icon: Sparkles },
            { id: 'bubbles', label: 'BONG BÓNG', icon: Wind },
            { id: 'dust', label: 'HẠT BỤI', icon: Activity },
          ].map((vfx) => (
            <button
              key={vfx.id}
              onClick={() => onUpdate('vfxType', vfx.id as TextStyle['vfxType'])}
              className={`flex flex-col items-center gap-2 rounded-xl border py-4 text-[8px] font-black uppercase transition-all ${
                style.vfxType === vfx.id
                  ? 'border-amber-400 bg-amber-500 text-black'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-500'
              }`}
            >
              {vfx.icon && <vfx.icon className="h-3.5 w-3.5" />}
              {vfx.label}
            </button>
          ))}
        </div>
        {style.vfxType !== 'none' && (
          <div className="glass-panel mt-4 space-y-6 rounded-2xl border border-white/[0.08] p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-[9px] font-black text-slate-400">
                <span>MẬT ĐỘ (INTENSITY)</span>
                <span className="text-amber-500">{style.vfxIntensity}</span>
              </div>
              <input
                type="range"
                min="10"
                max="400"
                value={style.vfxIntensity}
                onChange={(e) => onUpdate('vfxIntensity', parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[9px] font-black text-slate-400">
                <span>TỐC ĐỘ (SPEED)</span>
                <span className="text-amber-500">{style.vfxSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={style.vfxSpeed}
                onChange={(e) => onUpdate('vfxSpeed', parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[8px] font-black uppercase text-slate-500">MÀU HIỆU ỨNG</label>
              <div className="flex gap-4">
                <input
                  type="color"
                  className="h-10 w-12 cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-transparent"
                  value={style.vfxColor}
                  onChange={(e) => onUpdate('vfxColor', e.target.value)}
                />
                <button
                  onClick={() => onUpdate('vfxColor', style.activeColor)}
                  className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.05] text-[8px] font-black uppercase transition-all hover:border-amber-500"
                >
                  Dùng Active Color
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
