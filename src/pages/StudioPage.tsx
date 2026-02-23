import React, { useState, useCallback } from 'react';
import LyricInput from '../components/LyricInput';
import LyricResult from '../components/LyricResult';
import { GenerationConfig, RewriteResponse } from '../types';
import { rewriteLyricsWithAPI } from '../services/lyricGenerationService';
import { useAuthStore } from '../stores/authStore';

export const StudioPage: React.FC = () => {
  const refreshAuth = useAuthStore((state) => state.refreshAuth);
  const [originalText, setOriginalText] = useState('');
  const [config, setConfig] = useState<GenerationConfig>({
    sourceLanguage: 'vi',
    theme: '',
    storyDescription: '',
    useThinking: true,
    intensity: 100,
    strictPhonetics: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsInfo, setCreditsInfo] = useState<{
    creditsUsed: number;
    remainingCredits: number;
  } | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!originalText.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCreditsInfo(null);

    try {
      const response = await rewriteLyricsWithAPI(originalText, config);

      // Extract rewrite data and credits info
      const { creditsUsed, remainingCredits, ...rewriteData } = response;

      setResult(rewriteData);
      setCreditsInfo({ creditsUsed, remainingCredits });

      // Refresh auth to update user credits in header
      await refreshAuth();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        'QUÁ TRÌNH SÁNG TÁC BỊ GIÁN ĐOẠN. VUI LÒNG THỬ LẠI.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalText, config, refreshAuth]);

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
        {creditsInfo && (
          <div className="animate-in fade-in slide-in-from-top-4 mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700">
            <div className="flex items-center justify-between gap-4">
              <span>Credits đã sử dụng: {creditsInfo.creditsUsed}</span>
              <span>Credits còn lại: {creditsInfo.remainingCredits}</span>
            </div>
          </div>
        )}
        <LyricResult data={result} />
      </div>
    </div>
  );
};
