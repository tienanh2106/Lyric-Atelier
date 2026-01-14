
import React, { useState, useCallback } from 'react';
import Banner from './components/Banner';
import LyricInput from './components/LyricInput';
import LyricResult from './components/LyricResult';
import { GenerationConfig, RewriteResponse } from './types';
import { rewriteLyrics } from './services/geminiService';

const App: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [config, setConfig] = useState<GenerationConfig>({
    sourceLanguage: 'vi',
    theme: 'AUTO_STAY_TRUE',
    storyDescription: '',
    useThinking: true,
    intensity: 100,
    strictPhonetics: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!originalText.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await rewriteLyrics(originalText, config.sourceLanguage, config.theme, config.storyDescription, config.useThinking, config.strictPhonetics);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "QUÁ TRÌNH SÁNG TÁC BỊ GIÁN ĐOẠN. VUI LÒNG THỬ LẠI.");
    } finally {
      setIsLoading(false);
    }
  }, [originalText, config]);

  return (
    <div className="min-h-screen flex flex-col items-center selection:bg-amber-500/20">
      <div className="w-full max-w-5xl mx-auto pt-10 pb-32 flex flex-col items-center">
        <Banner />
        <LyricInput
          value={originalText}
          onChange={setOriginalText}
          config={config}
          onConfigChange={setConfig}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
        {error && (
          <div className="mt-10 px-6 py-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-700 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4">
            {error}
          </div>
        )}
        <LyricResult data={result} />
      </div>

      <footer className="fixed bottom-0 left-0 w-full p-6 border-t border-slate-200 bg-white/90 backdrop-blur-2xl z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <div className={`w-1.5 h-1.5 rounded-full ${config.strictPhonetics ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Mode: {config.strictPhonetics ? 'Locked Tonal' : 'Creative Adaptive'}
            </span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">© ATELIER PLATINUM 2025</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
