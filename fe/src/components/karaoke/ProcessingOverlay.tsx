import React from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';

interface ProcessingOverlayProps {
  isProcessing: boolean;
  message: string;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ isProcessing, message }) => {
  if (!isProcessing) return null;
  return (
    <div className="bg-[#080910]/98 animate-fadeIn fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-10">
        <BrainCircuit className="h-24 w-24 animate-pulse text-amber-500" />
        <Sparkles className="absolute -right-2 -top-2 h-8 w-8 animate-bounce text-amber-300" />
      </div>
      <h2 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-4xl font-black uppercase italic tracking-tighter text-transparent">
        {message}
      </h2>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
        AI đang tính toán nhịp phách (Word-Sync)...
      </p>
    </div>
  );
};
