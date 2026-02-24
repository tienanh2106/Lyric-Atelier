import React, { useState, useRef } from 'react';
import { GenerationConfig } from '../types';
import {
  detectThemeAndStoryWithAPI,
  uploadAndExtractLyrics,
  generateRandomScenarioWithAPI,
} from '../services/lyricHelperService';

interface LyricInputProps {
  value: string;
  onChange: (val: string) => void;
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const LyricInput: React.FC<LyricInputProps> = ({
  value,
  onChange,
  config,
  onConfigChange,
  onGenerate,
  isLoading,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes = [
    { label: '✨ Tự động', value: '', desc: 'Giữ nguyên linh hồn bản gốc' },
    { label: '🕊️ Trịnh Công Sơn', value: 'Trịnh Công Sơn', desc: 'Triết lý, hư vô, thiền vị' },
    { label: '🎻 Ngô Thụy Miên', value: 'Ngô Thụy Miên', desc: 'Trữ tình, lãng mạn cổ điển' },
    { label: '🎸 Lam Phương', value: 'Lam Phương', desc: 'Hoài niệm, Bolero, sâu sắc' },
    { label: '🌃 Phú Quang', value: 'Phú Quang', desc: 'Hà Nội, phố cũ, nỗi nhớ' },
    { label: '📖 Phan Mạnh Quỳnh', value: 'Phan Mạnh Quỳnh', desc: 'Tự sự, mộc mạc, đời thường' },
    { label: '📝 Đen Vâu', value: 'Đen Vâu', desc: 'Ẩn dụ, phóng khoáng, tự tại' },
    { label: '🌿 Vũ. (Indie)', value: 'Vũ. Indie', desc: 'Indie Pop, buồn nhẹ nhàng' },
    { label: '💔 Mr. Siro', value: 'Mr. Siro', desc: 'Ballad thất tình, đau đớn' },
    { label: '📱 Sơn Tùng M-TP', value: 'Sơn Tùng M-TP', desc: 'Pop hiện đại, catchy, trendy' },
    { label: '🍎 Táo (Melodic)', value: 'Táo Melodic', desc: 'Melodic Rap, nội tâm, tối' },
    { label: '✨ Hứa Kim Tuyền', value: 'Hứa Kim Tuyền', desc: 'Nhạc Pop văn minh, cảm xúc' },
  ];

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
      // Upload file and extract lyrics
      const lyrics = await uploadAndExtractLyrics(file);

      if (!lyrics || lyrics.trim() === '') {
        throw new Error('Không thể trích xuất lời bài hát từ file. Vui lòng thử file khác.');
      }

      onChange(lyrics);

      // Detect theme and story from extracted lyrics
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-8 px-4">
      {/* --- PHẦN 01: CHỌN PHONG CÁCH (BẢNG GRID DỄ DÙNG) --- */}
      <section className="glass-panel flex flex-col gap-6 rounded-[2.5rem] border border-slate-200 p-6 md:p-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
              Step 01
            </span>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Chọn Phong cách Nhạc sỹ
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
            <span className="text-[9px] font-bold uppercase text-slate-600">Live Studio</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => onConfigChange({ ...config, theme: t.value })}
              className={`group flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all ${config.theme === t.value ? 'border-amber-500 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'}`}
            >
              <span
                className={`text-[12px] font-black uppercase tracking-tight ${config.theme === t.value ? 'text-black' : 'text-slate-800'}`}
              >
                {t.label}
              </span>
              <span
                className={`text-[9px] font-medium leading-tight ${config.theme === t.value ? 'text-black/60' : 'text-slate-600 group-hover:text-slate-700'}`}
              >
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* --- PHẦN 02: KỊCH BẢN --- */}
      <section className="glass-panel flex flex-col gap-4 rounded-[2rem] border border-slate-200 p-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
              Step 02
            </span>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Nội dung / Kịch bản
            </h3>
          </div>
          <button
            onClick={handleRandomizeScenario}
            disabled={isGeneratingScenario}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase text-amber-600 transition-all hover:border-slate-300 hover:bg-slate-100"
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
            {isGeneratingScenario ? 'Đang nghĩ...' : 'AI Gợi ý kịch bản'}
          </button>
        </div>
        <textarea
          className="custom-scrollbar h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-[15px] font-medium leading-relaxed text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-amber-500/50 focus:bg-white"
          placeholder="Mô tả câu chuyện bạn muốn kể (Ví dụ: Một chàng trai đứng dưới hiên nhà cũ, chờ đợi người thương trong một buổi chiều thu vắng...)"
          value={config.storyDescription}
          onChange={(e) => onConfigChange({ ...config, storyDescription: e.target.value })}
        />
      </section>

      {/* --- PHẦN 03: EDITOR --- */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
              Step 03
            </span>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Ca từ gốc
            </h3>
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

        {/* Upload Error Message */}
        {uploadError && (
          <div className="animate-in fade-in slide-in-from-top-4 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-700">
            ❌ {uploadError}
          </div>
        )}

        <div className="glass-panel group relative overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-inner">
          <textarea
            className="custom-scrollbar h-72 w-full resize-none bg-transparent p-10 font-classic text-xl italic leading-relaxed text-slate-500 outline-none transition-all duration-700 placeholder:text-slate-400 focus:text-slate-900"
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

      {/* --- PHẦN 04: ACTION --- */}
      <div className="flex flex-col items-center gap-6 pb-12">
        <button
          onClick={() => onConfigChange({ ...config, strictPhonetics: !config.strictPhonetics })}
          className={`group flex items-center gap-3 rounded-full border px-8 py-4 transition-all duration-700 ${config.strictPhonetics ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
        >
          <div
            className={`h-2 w-2 rounded-full ${config.strictPhonetics ? 'animate-pulse bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-slate-300'}`}
          ></div>
          <span className="text-[11px] font-black uppercase tracking-widest">
            Locked Tonal Match (Khớp âm vần 100%)
          </span>
        </button>

        <button
          onClick={onGenerate}
          disabled={isLoading || !value.trim()}
          className={`shadow-3xl group relative h-20 w-full overflow-hidden rounded-[3rem] transition-all duration-700 md:h-24 ${isLoading || !value.trim() ? 'cursor-not-allowed bg-slate-200 text-slate-400 grayscale' : 'bg-amber-500 text-black hover:scale-[1.01] active:scale-[0.99]'}`}
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="animate-pulse text-[13px] font-black uppercase tracking-[0.6em]">
                Sáng tác ca từ mới...
              </span>
              <div className="flex gap-1">
                <div className="h-1 w-1 animate-bounce rounded-full bg-black/40 delay-75"></div>
                <div className="h-1 w-1 animate-bounce rounded-full bg-black/40 delay-150"></div>
                <div className="delay-225 h-1 w-1 animate-bounce rounded-full bg-black/40"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="ml-4 text-lg font-black uppercase tracking-[1em]">DỆT CA KHÚC</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
                Sử dụng mô hình Gemini 2.5 Pro Preview
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default LyricInput;
