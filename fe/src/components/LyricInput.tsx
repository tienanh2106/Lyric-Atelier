import React, { useState, useRef } from 'react';
import { GenerationConfig } from '../types';
import {
  detectThemeAndStoryWithAPI,
  uploadAndExtractLyrics,
  generateRandomScenarioWithAPI,
} from '../services/lyricHelperService';
import { LYRIC_THEMES } from '../constants';
import { Textarea } from './ui/Input';

interface LyricInputProps {
  value: string;
  onChange: (val: string) => void;
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
  onGenerate: () => void;
  isLoading: boolean;
  progress: number;
}

const LyricInput: React.FC<LyricInputProps> = ({
  value,
  onChange,
  config,
  onConfigChange,
  onGenerate,
  isLoading,
  progress,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes = LYRIC_THEMES;

  const handleRandomizeScenario = async () => {
    setIsGeneratingScenario(true);
    try {
      const scenario = await generateRandomScenarioWithAPI(config.theme);
      onConfigChange({ ...config, storyDescription: scenario });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    setUploadError(null);
    try {
      const lyrics = await uploadAndExtractLyrics(file);

      if (!lyrics || lyrics.trim() === '') {
        throw new Error('Không thể trích xuất lời bài hát từ file. Vui lòng thử file khác.');
      }

      onChange(lyrics);

      const result = await detectThemeAndStoryWithAPI(lyrics);
      onConfigChange({
        ...config,
        theme: result.theme || themes[0].value,
        storyDescription: result.storyDescription,
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể xử lý file. Vui lòng thử lại.';
      setUploadError(errorMessage);
    } finally {
      setIsTranscribing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 px-4">
      {/* ── SECTION 01: LINH HỒN & KỸ THUẬT ──────────────────────── */}
      <section className="glass-panel flex flex-col gap-8 rounded-[2.5rem] border border-slate-200 p-8 md:p-10">
        {/* Header row: label (left) + mode toggle (right) */}
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
              Step 01
            </span>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Linh hồn &amp; Kỹ thuật
            </h3>
          </div>

          {/* Mode toggle — Platinum style */}
          <div className="flex gap-1.5 rounded-[2rem] border border-slate-200 bg-slate-100 p-1.5">
            <button
              onClick={() => onConfigChange({ ...config, mode: 'strict' })}
              className={`flex flex-col items-center gap-0.5 rounded-3xl px-5 py-3 transition-all ${
                config.mode === 'strict'
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-widest">
                Đồng điệu 100%
              </span>
              <span
                className={`text-[9px] font-medium ${config.mode === 'strict' ? 'text-black/60' : 'text-slate-400'}`}
              >
                Khớp 100% dấu &amp; số từ
              </span>
            </button>
            <button
              onClick={() => onConfigChange({ ...config, mode: 'creative' })}
              className={`flex flex-col items-center gap-0.5 rounded-3xl px-5 py-3 transition-all ${
                config.mode === 'creative'
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-widest">
                Sáng tác tự do
              </span>
              <span
                className={`text-[9px] font-medium ${config.mode === 'creative' ? 'text-black/60' : 'text-slate-400'}`}
              >
                Như viết lời nhạc nước ngoài
              </span>
            </button>
          </div>
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => onConfigChange({ ...config, theme: t.value })}
              className={`group flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all ${
                config.theme === t.value
                  ? 'border-amber-500 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span
                className={`text-[12px] font-black uppercase tracking-tight ${config.theme === t.value ? 'text-black' : 'text-slate-800'}`}
              >
                {t.label}
              </span>
              <span
                className={`text-[9px] font-medium leading-tight ${config.theme === t.value ? 'text-black/60' : 'text-slate-500 group-hover:text-slate-600'}`}
              >
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── SECTION 02: CONFIG ROW — 2 COLUMNS ────────────────────── */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Gender panel */}
        <div className="glass-panel flex flex-col gap-4 rounded-[2rem] border border-slate-200 p-6">
          <div className="flex flex-col gap-1 px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
              Cấu hình
            </span>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Chất giọng Cover
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onConfigChange({ ...config, gender: 'female' })}
              className={`flex-1 rounded-xl border py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                config.gender === 'female'
                  ? 'border-amber-500 bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              🎤 Nữ
            </button>
            <button
              onClick={() => onConfigChange({ ...config, gender: 'male' })}
              className={`flex-1 rounded-xl border py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                config.gender === 'male'
                  ? 'border-amber-500 bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              🎙️ Nam
            </button>
          </div>
        </div>

        {/* Story panel — click to open modal */}
        <div className="glass-panel flex flex-col gap-4 rounded-[2rem] border border-slate-200 p-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
                Step 02
              </span>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                Kịch bản dệt lời
              </h3>
            </div>
            <button
              onClick={handleRandomizeScenario}
              disabled={isGeneratingScenario}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase text-amber-600 transition-all hover:border-slate-300 hover:bg-slate-100 disabled:opacity-50"
            >
              <svg
                className={`h-3 w-3 ${isGeneratingScenario ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isGeneratingScenario ? 'Đang nghĩ...' : 'AI gợi ý'}
            </button>
          </div>

          <div
            onClick={() => setIsPreviewOpen(true)}
            className="min-h-[60px] flex-1 cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[13px] italic leading-relaxed text-slate-500 transition-all hover:border-amber-500/40 hover:bg-white"
          >
            {config.storyDescription || 'Click để viết kịch bản bài hát...'}
          </div>
        </div>
      </section>

      {/* ── SECTION 03: CA TỪ GỐC ─────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
                Step 03
              </span>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                Ca từ gốc
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">{value.length} ký tự</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isTranscribing}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[9px] font-black uppercase text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nhập từ Audio/Video
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="audio/*,video/*"
            />
          </div>
        </div>

        {uploadError && (
          <div className="animate-in fade-in slide-in-from-top-4 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-700">
            ❌ {uploadError}
          </div>
        )}
        <div className="relative overflow-hidden rounded-2xl p-1">
          <Textarea
            className="resize-y"
            placeholder="Dán lời bài hát cũ tại đây..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {isTranscribing && (
            <div className="animate-in fade-in absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/95 backdrop-blur-xl duration-500">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500/20">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                <svg
                  className="h-6 w-6 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="animate-pulse text-[11px] font-black uppercase tracking-[0.5em] text-amber-500">
                Đang rã sóng âm...
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── GENERATE BUTTON WITH PROGRESS BAR ─────────────────────── */}
      <div className="pb-12">
        <button
          onClick={onGenerate}
          disabled={isLoading || !value.trim()}
          className={`group relative h-24 w-full overflow-hidden rounded-[3rem] transition-all duration-700 md:h-28 ${
            isLoading
              ? 'cursor-default bg-slate-200'
              : !value.trim()
                ? 'cursor-not-allowed bg-slate-200'
                : 'bg-amber-500 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {/* Progress fill */}
          {isLoading && (
            <div
              className="absolute inset-y-0 left-0 bg-amber-400/70 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          )}

          {/* Shimmer on idle */}
          {!isLoading && value.trim() && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          )}

          <span className="relative z-10 flex flex-col items-center justify-center gap-1">
            {isLoading ? (
              <>
                <span className="animate-pulse text-[15px] font-black uppercase tracking-[0.8em] text-amber-800">
                  PROCESSING {Math.round(progress)}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700/60">
                  {config.mode === 'strict' ? 'Đồng điệu 100%' : 'Sáng tác tự do'} ·{' '}
                  {config.gender === 'female' ? 'Nữ' : 'Nam'}
                </span>
              </>
            ) : (
              <>
                <span
                  className={`ml-4 text-xl font-black uppercase tracking-[1em] ${!value.trim() ? 'text-slate-400' : 'text-black'}`}
                >
                  DỆT CA KHÚC
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] ${!value.trim() ? 'text-slate-400' : 'text-black/50'}`}
                >
                  Sử dụng mô hình{' '}
                  {config.useThinking ? 'Gemini 2.5 Pro Preview' : 'Gemini 2.5 Flash'}
                </span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* ── STORY MODAL ────────────────────────────────────────────── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="relative flex w-full max-w-3xl flex-col gap-6 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-2xl md:p-10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
                  Step 02
                </span>
                <h2 className="font-classic text-3xl italic text-slate-900">Kịch bản dệt lời</h2>
              </div>
              <button
                onClick={handleRandomizeScenario}
                disabled={isGeneratingScenario}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase text-amber-600 transition-all hover:border-slate-300 hover:bg-slate-100 disabled:opacity-50"
              >
                <svg
                  className={`h-3 w-3 ${isGeneratingScenario ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isGeneratingScenario ? 'Đang nghĩ...' : 'AI gợi ý ý tưởng'}
              </button>
            </div>

            <Textarea
              className="h-64 resize-y"
              value={config.storyDescription}
              onChange={(e) => onConfigChange({ ...config, storyDescription: e.target.value })}
              placeholder="Ví dụ: Viết về một chàng trai đứng dưới mưa đợi người yêu cũ, cảm xúc hối hận nhưng vẫn chúc phúc..."
              autoFocus
            />

            <button
              onClick={() => setIsPreviewOpen(false)}
              className="w-full rounded-full bg-amber-500 py-5 text-[12px] font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.02] active:scale-[0.99]"
            >
              Xác nhận kịch bản
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LyricInput;
