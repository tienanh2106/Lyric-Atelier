import React, { useState, useCallback } from 'react';
import LyricInput from '../components/LyricInput';
import LyricResult from '../components/LyricResult';
import { GenerationConfig, RewriteResponse } from '../types';
import { rewriteLyrics } from '../services/geminiService';

export const StudioPage: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [config, setConfig] = useState<GenerationConfig>({
    sourceLanguage: 'vi',
    theme: 'AUTO_STAY_TRUE',
    storyDescription: '',
    useThinking: true,
    intensity: 100,
    strictPhonetics: true,
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
      const data = await rewriteLyrics(
        originalText,
        config.sourceLanguage,
        config.theme,
        config.storyDescription,
        config.useThinking,
        config.strictPhonetics
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'QUÁ TRÌNH SÁNG TÁC BỊ GIÁN ĐOẠN. VUI LÒNG THỬ LẠI.');
    } finally {
      setIsLoading(false);
    }
  }, [originalText, config]);

  return (
    <div className="flex min-h-screen flex-col items-center selection:bg-amber-500/20">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-10">
        <LyricInput
          value={originalText}
          onChange={setOriginalText}
          config={config}
          onConfigChange={setConfig}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
        {error && (
          <div className="animate-in fade-in slide-in-from-top-4 mt-10 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-red-700">
            {error}
          </div>
        )}
        <LyricResult data={result} />
      </div>
    </div>
  );
};
