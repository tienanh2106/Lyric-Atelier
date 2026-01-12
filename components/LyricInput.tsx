
import React, { useState, useRef } from 'react';
import { GenerationConfig } from '../types';
import { detectThemeAndStory, extractLyricsFromMedia, generateRandomScenario } from '../services/geminiService';

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
  isLoading 
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes = [
    { label: "✨ Tự động", value: "AUTO_STAY_TRUE", desc: "Giữ nguyên linh hồn bản gốc" },
    { label: "🕊️ Trịnh Công Sơn", value: "Trịnh Công Sơn", desc: "Triết lý, hư vô, thiền vị" },
    { label: "🎻 Ngô Thụy Miên", value: "Ngô Thụy Miên", desc: "Trữ tình, lãng mạn cổ điển" },
    { label: "🎸 Lam Phương", value: "Lam Phương", desc: "Hoài niệm, Bolero, sâu sắc" },
    { label: "🌃 Phú Quang", value: "Phú Quang", desc: "Hà Nội, phố cũ, nỗi nhớ" },
    { label: "📖 Phan Mạnh Quỳnh", value: "Phan Mạnh Quỳnh", desc: "Tự sự, mộc mạc, đời thường" },
    { label: "📝 Đen Vâu", value: "Đen Vâu", desc: "Ẩn dụ, phóng khoáng, tự tại" },
    { label: "🌿 Vũ. (Indie)", value: "Vũ. Indie", desc: "Indie Pop, buồn nhẹ nhàng" },
    { label: "💔 Mr. Siro", value: "Mr. Siro", desc: "Ballad thất tình, đau đớn" },
    { label: "📱 Sơn Tùng M-TP", value: "Sơn Tùng M-TP", desc: "Pop hiện đại, catchy, trendy" },
    { label: "🍎 Táo (Melodic)", value: "Táo Melodic", desc: "Melodic Rap, nội tâm, tối" },
    { label: "✨ Hứa Kim Tuyền", value: "Hứa Kim Tuyền", desc: "Nhạc Pop văn minh, cảm xúc" },
  ];

  const handleRandomizeScenario = async () => {
    setIsGeneratingScenario(true);
    try {
      const scenario = await generateRandomScenario(config.theme);
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
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const lyrics = await extractLyricsFromMedia(base64Data, file.type);
        onChange(lyrics);
        const result = await detectThemeAndStory(lyrics);
        onConfigChange({ ...config, theme: result.theme || themes[0].value, storyDescription: result.storyDescription });
        setIsTranscribing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 px-4">
      
      {/* --- PHẦN 01: CHỌN PHONG CÁCH (BẢNG GRID DỄ DÙNG) --- */}
      <section className="glass-panel rounded-[2.5rem] p-6 md:p-8 border border-white/5 flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Step 01</span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Chọn Phong cách Nhạc sỹ</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Live Studio</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => onConfigChange({...config, theme: t.value})}
              className={`flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all text-left group ${config.theme === t.value ? 'bg-amber-500 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              <span className={`text-[12px] font-black uppercase tracking-tight ${config.theme === t.value ? 'text-black' : 'text-slate-200'}`}>
                {t.label}
              </span>
              <span className={`text-[9px] font-medium leading-tight ${config.theme === t.value ? 'text-black/60' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* --- PHẦN 02: KỊCH BẢN --- */}
      <section className="glass-panel rounded-[2rem] p-6 border border-white/5 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Step 02</span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Nội dung / Kịch bản</h3>
          </div>
          <button 
            onClick={handleRandomizeScenario}
            disabled={isGeneratingScenario}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 transition-all text-[10px] font-black uppercase text-amber-500/80"
          >
            <svg className={`w-3 h-3 ${isGeneratingScenario ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
            {isGeneratingScenario ? 'Đang nghĩ...' : 'AI Gợi ý kịch bản'}
          </button>
        </div>
        <textarea 
          className="w-full h-24 px-6 py-4 bg-white/[0.02] rounded-2xl border border-white/10 text-[15px] leading-relaxed font-medium text-slate-300 outline-none focus:border-amber-500/30 resize-none transition-all placeholder:text-slate-800 custom-scrollbar"
          placeholder="Mô tả câu chuyện bạn muốn kể (Ví dụ: Một chàng trai đứng dưới hiên nhà cũ, chờ đợi người thương trong một buổi chiều thu vắng...)"
          value={config.storyDescription}
          onChange={(e) => onConfigChange({...config, storyDescription: e.target.value})}
        />
      </section>

      {/* --- PHẦN 03: EDITOR --- */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Step 03</span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Ca từ gốc</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition-all text-[9px] font-black uppercase text-slate-400"
            >
              Nhập từ Audio/Video
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="audio/*,video/*" />
          </div>
        </div>

        <div className="glass-panel rounded-[2.5rem] relative overflow-hidden border border-white/5 group shadow-inner">
          <textarea
            className="w-full h-72 p-10 bg-transparent outline-none resize-none text-xl font-classic italic text-white/50 leading-relaxed custom-scrollbar placeholder:text-slate-800 focus:text-white/90 transition-all duration-700"
            placeholder="Dán lời bài hát cũ tại đây..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {isTranscribing && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
              <div className="w-16 h-16 border-2 border-amber-500/20 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] animate-pulse">Đang rã sóng âm...</span>
            </div>
          )}
        </div>
      </section>

      {/* --- PHẦN 04: ACTION --- */}
      <div className="flex flex-col items-center gap-6 pb-12">
        <button 
          onClick={() => onConfigChange({...config, strictPhonetics: !config.strictPhonetics})}
          className={`group flex items-center gap-3 px-8 py-4 rounded-full border transition-all duration-700 ${config.strictPhonetics ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'bg-white/5 border-white/10 text-slate-600'}`}
        >
          <div className={`w-2 h-2 rounded-full ${config.strictPhonetics ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-slate-800'}`}></div>
          <span className="text-[11px] font-black uppercase tracking-widest">Locked Tonal Match (Khớp âm vần 100%)</span>
        </button>

        <button 
          onClick={onGenerate}
          disabled={isLoading || !value.trim()}
          className={`group relative w-full h-20 md:h-24 rounded-[3rem] overflow-hidden transition-all duration-700 shadow-3xl ${isLoading || !value.trim() ? 'bg-white/5 text-slate-700 cursor-not-allowed grayscale' : 'bg-amber-500 text-black hover:scale-[1.01] active:scale-[0.99]'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2">
               <span className="text-[13px] font-black uppercase tracking-[0.6em] animate-pulse">Sáng tác ca từ mới...</span>
               <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-black/40 animate-bounce delay-75"></div>
                  <div className="w-1 h-1 rounded-full bg-black/40 animate-bounce delay-150"></div>
                  <div className="w-1 h-1 rounded-full bg-black/40 animate-bounce delay-225"></div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-lg font-black uppercase tracking-[1em] ml-4">DỆT CA KHÚC</span>
              <span className="text-[10px] font-bold text-black/50 uppercase tracking-[0.2em]">Sử dụng mô hình Gemini 3 Pro Preview</span>
            </div>
          )}
        </button>
      </div>

    </div>
  );
};

export default LyricInput;
