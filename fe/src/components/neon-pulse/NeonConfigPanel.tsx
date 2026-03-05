import { useState, type ChangeEvent, type ReactNode } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Type,
  Activity,
  Music,
  Layers,
  Sliders,
  Zap,
  Download,
  Camera,
  Video,
} from 'lucide-react';
import { NeonConfig, WaveVariant, TextAnimation } from '../../types/neonPulseTypes';
import {
  NEON_FONTS,
  WAVE_VARIANT_LABELS,
  TEXT_ANIMATION_LABELS,
  THEME_COLORS,
  BLEND_MODES,
} from '../../constants/neonPulseConstants';
import { useGenerateNeonTheme } from '../../services/endpoints/gen-a-i';

interface NeonConfigPanelProps {
  config: NeonConfig;
  onUpdate: (config: NeonConfig) => void;
  onAudioFileChange: (file: File) => void;
  isRecording: boolean;
  onToggleRecord: () => void;
  onExportWebP: () => void;
  onExportMP4: () => void;
  isExportingMP4: boolean;
  exportProgress: number;
  onStopMP4Export: () => void;
}

const SliderRow = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wider text-white/60">{label}</span>
      <span className="font-mono text-[10px] text-white/80">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
    />
  </div>
);

const Toggle = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase tracking-wider text-white/60">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative h-4 w-8 rounded-full transition-colors ${value ? 'bg-cyan-500' : 'bg-white/20'}`}
    >
      <div
        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${value ? 'left-4' : 'left-0.5'}`}
      />
    </button>
  </div>
);

export const NeonConfigPanel = ({
  config,
  onUpdate,
  onAudioFileChange,
  isRecording,
  onToggleRecord,
  onExportWebP,
  onExportMP4,
  isExportingMP4,
  exportProgress,
  onStopMP4Export,
}: NeonConfigPanelProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'visuals' | 'effects' | 'text' | 'export'>(
    'media'
  );
  const [mood, setMood] = useState('upbeat synthwave');

  const { mutate: generateTheme, isPending: isGenerating } = useGenerateNeonTheme();

  const update = <K extends keyof NeonConfig>(key: K, value: NeonConfig[K]) => {
    onUpdate({ ...config, [key]: value });
  };

  const handleGenerate = () => {
    generateTheme(
      { data: { mood } },
      {
        onSuccess: (result) => {
          setIsUnlocked(true);
          try {
            const raw = (result as unknown as { generatedText: string }).generatedText;
            const cleaned = raw
              .replaceAll(/```json\n?/g, '')
              .replaceAll(/```\n?/g, '')
              .trim();
            const parsed = JSON.parse(cleaned);
            onUpdate({
              ...config,
              songTitle: parsed.songTitle ?? config.songTitle,
              themeColor: parsed.colorTheme ?? config.themeColor,
              useCustomGradient: false,
            });
          } catch {
            // ignore parse errors — still unlocked
          }
        },
      }
    );
  };

  const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAudioFileChange(file);
  };

  const handleBgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate({
        ...config,
        backgroundImageUrl: url,
        isBackgroundVideo: file.type.startsWith('video/'),
      });
    }
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) update('logoUrl', URL.createObjectURL(file));
  };

  const tabs: { key: typeof activeTab; icon: ReactNode }[] = [
    { key: 'media', icon: <Music size={18} /> },
    { key: 'visuals', icon: <Layers size={18} /> },
    { key: 'effects', icon: <Sparkles size={18} /> },
    { key: 'text', icon: <Type size={18} /> },
    { key: 'export', icon: <Download size={18} /> },
  ];

  if (!isUnlocked) {
    return (
      <div className="flex h-full w-[360px] shrink-0 flex-col border-l border-white/10 bg-black/70 font-sans text-gray-100 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/20 p-5">
          <h2 className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-sm font-bold uppercase tracking-widest text-transparent">
            Studio Controls
          </h2>
        </div>

        {/* Lock screen */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
            <Sparkles size={28} className="text-cyan-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">Generate a Theme First</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/40">
              Describe your mood/style to unlock all settings and export options.
            </p>
          </div>

          <div className="w-full space-y-3">
            <input
              type="text"
              placeholder="e.g. upbeat synthwave, chill lo-fi..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:outline-none"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !mood.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 py-3 text-xs font-bold text-cyan-400 transition-all hover:from-cyan-500/30 hover:to-purple-500/30 disabled:opacity-50"
            >
              <Sparkles size={14} />
              {isGenerating ? 'Generating...' : '✦ Generate Theme'}
            </button>
            <p className="text-center text-[9px] text-white/20">5 credits</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-[360px] shrink-0 flex-col border-l border-white/10 bg-black/70 font-sans text-gray-100 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/20 p-5">
        <h2 className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-sm font-bold uppercase tracking-widest text-transparent">
          Studio Controls
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-black/20">
        {tabs.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center p-4 transition-all ${activeTab === key ? 'border-b-2 border-cyan-500 bg-white/10 text-cyan-400' : 'text-white/40 hover:bg-white/5 hover:text-white/70'}`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/40">Assets</p>

            {[
              {
                icon: <Music size={13} className="text-purple-400" />,
                label: 'Audio Track',
                sub: config.songTitle || 'Select file…',
                accept: 'audio/*',
                onChange: handleAudioChange,
                bg: 'bg-purple-500/20',
              },
              {
                icon: <ImageIcon size={13} className="text-blue-400" />,
                label: 'Background',
                sub: 'Image or Video',
                accept: 'image/*,video/*',
                onChange: handleBgChange,
                bg: 'bg-blue-500/20',
              },
              {
                icon: <Zap size={13} className="text-pink-400" />,
                label: 'Logo Overlay',
                sub: config.logoUrl ? 'Change' : 'None',
                accept: 'image/*',
                onChange: handleLogoChange,
                bg: 'bg-pink-500/20',
              },
            ].map(({ icon, label, sub, accept, onChange, bg }) => (
              <label
                key={label}
                className="group flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:bg-black/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded ${bg} flex items-center justify-center`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/90">{label}</p>
                    <p className="max-w-[150px] truncate text-[10px] text-white/50">{sub}</p>
                  </div>
                </div>
                <Upload size={13} className="text-white/30 group-hover:text-white/80" />
                <input type="file" accept={accept} onChange={onChange} className="hidden" />
              </label>
            ))}

            {/* Meta */}
            <div className="space-y-3 pt-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-white/40">
                Song Info
              </p>
              {(
                [
                  ['songTitle', 'Title'],
                  ['subtitle', 'Subtitle'],
                ] as [keyof NeonConfig, string][]
              ).map(([key, label]) => (
                <div key={key}>
                  <p className="mb-1 text-[10px] text-white/50">{label}</p>
                  <input
                    type="text"
                    value={config[key] as string}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* AI Theme Generator */}
            <div className="space-y-3 border-t border-white/10 pt-2">
              <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/40">
                <Sparkles size={10} /> AI Theme Generator
              </p>
              <input
                type="text"
                placeholder="e.g. upbeat synthwave"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 py-2 text-xs font-bold text-cyan-400 transition-all hover:from-cyan-500/30 hover:to-purple-500/30 disabled:opacity-50"
              >
                {isGenerating ? 'Generating…' : '✦ Generate Theme'}
              </button>
              <p className="text-center text-[9px] text-white/30">
                5 credits · updates title + color theme
              </p>
            </div>
          </div>
        )}

        {/* VISUALS TAB */}
        {activeTab === 'visuals' && (
          <div className="space-y-6">
            {/* Wave Variant */}
            <div>
              <p className="mb-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/40">
                <Activity size={10} /> Visualizer
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(WaveVariant).map((v) => (
                  <button
                    key={v}
                    onClick={() => update('waveVariant', v)}
                    className={`rounded-lg px-2 py-2 text-[10px] font-bold transition-all ${config.waveVariant === v ? 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-400' : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {WAVE_VARIANT_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Color */}
            <div>
              <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-white/40">
                Theme Color
              </p>
              <div className="flex flex-wrap gap-2">
                {THEME_COLORS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update('themeColor', value)}
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-all ${config.themeColor === value ? 'border-white/60 bg-white/20 text-white' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Gradient */}
            <div>
              <Toggle
                label="Custom Gradient"
                value={config.useCustomGradient}
                onChange={(v) => update('useCustomGradient', v)}
              />
              {config.useCustomGradient && (
                <div className="mt-2 flex gap-3">
                  <div className="flex-1">
                    <p className="mb-1 text-[9px] text-white/40">Color 1</p>
                    <input
                      type="color"
                      value={config.visualizerColor1}
                      onChange={(e) => update('visualizerColor1', e.target.value)}
                      className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-[9px] text-white/40">Color 2</p>
                    <input
                      type="color"
                      value={config.visualizerColor2}
                      onChange={(e) => update('visualizerColor2', e.target.value)}
                      className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            <Toggle
              label="Auto Gradient"
              value={config.autoGradient}
              onChange={(v) => update('autoGradient', v)}
            />

            <SliderRow
              label="Size"
              min={0.5}
              max={3}
              step={0.1}
              value={config.visualizerSize}
              onChange={(v) => update('visualizerSize', v)}
            />
            <SliderRow
              label="Opacity"
              min={0.1}
              max={1}
              step={0.05}
              value={config.visualizerOpacity}
              onChange={(v) => update('visualizerOpacity', v)}
            />

            {/* Blend mode */}
            <div>
              <p className="mb-1 text-[9px] uppercase tracking-wider text-white/40">Blend Mode</p>
              <select
                value={config.visualizerBlendMode}
                onChange={(e) =>
                  update(
                    'visualizerBlendMode',
                    e.target.value as unknown as GlobalCompositeOperation
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                {BLEND_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Center position */}
            <SliderRow
              label="Center X"
              min={0}
              max={100}
              unit="%"
              value={config.visualizerCenterX}
              onChange={(v) => update('visualizerCenterX', v)}
            />
            <SliderRow
              label="Center Y"
              min={0}
              max={100}
              unit="%"
              value={config.visualizerCenterY}
              onChange={(v) => update('visualizerCenterY', v)}
            />

            {/* Background Deep Tuning */}
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/40">
                <Sliders size={10} /> Background Tuning
              </p>
              <div className="space-y-3">
                <Toggle
                  label="Auto Brightness"
                  value={config.bgAutoBrightness}
                  onChange={(v) => update('bgAutoBrightness', v)}
                />
                {config.bgAutoBrightness ? (
                  <>
                    <SliderRow
                      label="Min Brightness"
                      min={0}
                      max={100}
                      unit="%"
                      value={config.bgAutoBrightnessMin}
                      onChange={(v) => update('bgAutoBrightnessMin', v)}
                    />
                    <SliderRow
                      label="Max Brightness"
                      min={100}
                      max={300}
                      unit="%"
                      value={config.bgAutoBrightnessMax}
                      onChange={(v) => update('bgAutoBrightnessMax', v)}
                    />
                  </>
                ) : (
                  <SliderRow
                    label="Brightness"
                    min={0}
                    max={300}
                    unit="%"
                    value={config.bgBrightness}
                    onChange={(v) => update('bgBrightness', v)}
                  />
                )}
                <SliderRow
                  label="Contrast"
                  min={0}
                  max={300}
                  unit="%"
                  value={config.bgContrast}
                  onChange={(v) => update('bgContrast', v)}
                />
                <SliderRow
                  label="Saturation"
                  min={0}
                  max={300}
                  unit="%"
                  value={config.bgSaturation}
                  onChange={(v) => update('bgSaturation', v)}
                />
                <SliderRow
                  label="Hue Rotate"
                  min={0}
                  max={360}
                  unit="°"
                  value={config.bgHueRotate}
                  onChange={(v) => update('bgHueRotate', v)}
                />
                <SliderRow
                  label="Blur"
                  min={0}
                  max={20}
                  step={0.5}
                  value={config.bgBlur}
                  onChange={(v) => update('bgBlur', v)}
                />
                <SliderRow
                  label="Vignette"
                  min={0}
                  max={100}
                  unit="%"
                  value={config.bgVignette}
                  onChange={(v) => update('bgVignette', v)}
                />

                {/* Tint */}
                <div className="space-y-2">
                  <p className="text-[9px] uppercase tracking-wider text-white/40">Tint</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.bgTintColor}
                      onChange={(e) => update('bgTintColor', e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                    <div className="flex-1">
                      <SliderRow
                        label="Intensity"
                        min={0}
                        max={1}
                        step={0.05}
                        value={config.bgTintIntensity}
                        onChange={(v) => update('bgTintIntensity', v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EFFECTS TAB */}
        {activeTab === 'effects' && (
          <div className="space-y-5">
            {/* Beat-reactive */}
            <div>
              <p className="mb-3 text-[9px] font-black uppercase tracking-wider text-white/40">
                Beat Reactive BG
              </p>
              <div className="space-y-3">
                <Toggle
                  label="BG Pulse"
                  value={config.bgPulse}
                  onChange={(v) => update('bgPulse', v)}
                />
                {config.bgPulse && (
                  <SliderRow
                    label="Pulse Strength"
                    min={0}
                    max={1}
                    step={0.05}
                    value={config.bgPulseStrength}
                    onChange={(v) => update('bgPulseStrength', v)}
                  />
                )}
                <Toggle
                  label="Beat Flash"
                  value={config.bgBeatFlash}
                  onChange={(v) => update('bgBeatFlash', v)}
                />
                <Toggle
                  label="Shake"
                  value={config.bgShake}
                  onChange={(v) => update('bgShake', v)}
                />
                <Toggle
                  label="Hue Shift"
                  value={config.bgHueShift}
                  onChange={(v) => update('bgHueShift', v)}
                />
              </div>
            </div>

            {/* Secondary Effects */}
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 text-[9px] font-black uppercase tracking-wider text-white/40">
                Secondary Effects
              </p>
              <div className="space-y-3">
                <Toggle
                  label="Star Field"
                  value={config.effectStarField}
                  onChange={(v) => update('effectStarField', v)}
                />
                {config.effectStarField && (
                  <SliderRow
                    label="Speed"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={config.effectStarFieldSpeed}
                    onChange={(v) => update('effectStarFieldSpeed', v)}
                  />
                )}

                <Toggle
                  label="Fireflies"
                  value={config.effectFireflies}
                  onChange={(v) => update('effectFireflies', v)}
                />
                {config.effectFireflies && (
                  <SliderRow
                    label="Count"
                    min={5}
                    max={100}
                    value={config.effectFirefliesCount}
                    onChange={(v) => update('effectFirefliesCount', v)}
                  />
                )}

                <Toggle
                  label="Shooting Stars"
                  value={config.effectShootingStars}
                  onChange={(v) => update('effectShootingStars', v)}
                />
                {config.effectShootingStars && (
                  <SliderRow
                    label="Frequency"
                    min={1}
                    max={100}
                    value={config.effectShootingStarsFreq}
                    onChange={(v) => update('effectShootingStarsFreq', v)}
                  />
                )}

                <Toggle
                  label="Radial Burst"
                  value={config.effectRadialBurst}
                  onChange={(v) => update('effectRadialBurst', v)}
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 text-[9px] font-black uppercase tracking-wider text-white/40">
                Progress Bar
              </p>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-[9px] text-white/40">Color</p>
                  <input
                    type="color"
                    value={config.progressBarColor}
                    onChange={(e) => update('progressBarColor', e.target.value)}
                    className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent"
                  />
                </div>
                <SliderRow
                  label="Position Y"
                  min={0}
                  max={100}
                  unit="%"
                  value={config.progressBarPositionY}
                  onChange={(v) => update('progressBarPositionY', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/40">
              Export Options
            </p>

            {/* WebP Screenshot */}
            <div className="space-y-2">
              <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-white/60">
                <Camera size={10} /> Screenshot
              </p>
              <p className="text-[10px] text-white/30">
                Chup anh frame hien tai — khong anh huong preview
              </p>
              <button
                onClick={onExportWebP}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                <Camera size={14} />
                Export WebP Image
              </button>
            </div>

            {/* WebM Recording */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-white/60">
                <Video size={10} /> Video WebM
              </p>
              <p className="text-[10px] text-white/30">Ghi man hinh + am thanh, tai ve WebM</p>
              <button
                onClick={onToggleRecord}
                disabled={isExportingMP4}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-xs font-bold transition-all disabled:opacity-40 ${
                  isRecording
                    ? 'border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full bg-red-500 ${isRecording ? 'animate-ping' : ''}`}
                />
                {isRecording ? 'Dung ghi & tai WebM' : 'Ghi WebM'}
              </button>
            </div>

            {/* MP4 Export */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-white/60">
                <Download size={10} /> Video MP4
              </p>
              <p className="text-[10px] text-white/30">
                Phat lai tu dau, ghi va convert sang MP4 (ffmpeg.wasm)
              </p>

              {isExportingMP4 ? (
                <div className="space-y-2">
                  {exportProgress < 10 ? (
                    <>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-red-400">Dang ghi...</span>
                        <button
                          onClick={onStopMP4Export}
                          className="rounded border border-red-500/50 px-2 py-0.5 text-[10px] text-red-400 hover:bg-red-500/20"
                        >
                          Dung ghi
                        </button>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full animate-pulse rounded-full bg-red-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-cyan-400">Converting MP4...</span>
                        <span className="font-mono text-white/60">{exportProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${exportProgress}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={onExportMP4}
                  disabled={isRecording}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 py-3 text-xs font-bold text-cyan-400 transition-all hover:from-cyan-500/20 hover:to-purple-500/20 disabled:opacity-40"
                >
                  <Download size={14} />
                  Export MP4
                </button>
              )}
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-5">
            {/* Font */}
            <div>
              <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-white/40">
                Font Family
              </p>
              <select
                value={config.titleFont}
                onChange={(e) => update('titleFont', e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:outline-none"
              >
                {NEON_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Color */}
            <div>
              <p className="mb-1 text-[9px] text-white/40">Color</p>
              <input
                type="color"
                value={config.titleColor}
                onChange={(e) => update('titleColor', e.target.value)}
                className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </div>

            <SliderRow
              label="Size"
              min={0.5}
              max={3}
              step={0.1}
              value={config.titleSize}
              onChange={(v) => update('titleSize', v)}
            />
            <SliderRow
              label="Glow"
              min={0}
              max={100}
              value={config.titleGlow}
              onChange={(v) => update('titleGlow', v)}
            />
            <SliderRow
              label="Letter Spacing"
              min={0}
              max={30}
              value={config.titleSpacing}
              onChange={(v) => update('titleSpacing', v)}
            />
            <SliderRow
              label="Position Y"
              min={0}
              max={100}
              unit="%"
              value={config.titlePositionY}
              onChange={(v) => update('titlePositionY', v)}
            />

            {/* Text Animation */}
            <div>
              <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-white/40">
                Animation
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(TextAnimation).map((a) => (
                  <button
                    key={a}
                    onClick={() => update('textAnimation', a)}
                    className={`rounded-lg py-2 text-[10px] font-bold transition-all ${config.textAnimation === a ? 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-400' : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {TEXT_ANIMATION_LABELS[a]}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Settings */}
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 text-[9px] font-black uppercase tracking-wider text-white/40">
                Logo
              </p>
              <div className="space-y-3">
                <SliderRow
                  label="Size"
                  min={0.3}
                  max={3}
                  step={0.1}
                  value={config.logoSize}
                  onChange={(v) => update('logoSize', v)}
                />
                <SliderRow
                  label="Glow"
                  min={0}
                  max={100}
                  value={config.logoGlow}
                  onChange={(v) => update('logoGlow', v)}
                />
                <SliderRow
                  label="Position Y"
                  min={0}
                  max={100}
                  unit="%"
                  value={config.logoPositionY}
                  onChange={(v) => update('logoPositionY', v)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
