
import React, { useState } from 'react';
import { RewriteResponse } from '../types';

interface LyricResultProps { data: RewriteResponse | null; }

const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[9px] font-black uppercase tracking-widest ${copied ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
    >
      {copied ? 'Success' : `Copy ${label}`}
    </button>
  );
};

const LyricResult: React.FC<LyricResultProps> = ({ data }) => {
  if (!data) return null;

  const fullNewLyrics = data.sections.map(s => `[${s.title}]\n${s.lines.map(l => l.rewritten).join('\n')}`).join('\n\n');
  const fullTransliteration = data.sections.map(s => `[${s.title}]\n${s.lines.map(l => l.transliteration || '').join('\n')}`).join('\n\n');

  return (
    <div className="w-full max-w-5xl mt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-40 px-4 flex flex-col gap-12">
      
      {/* --- PHẦN 1: THÔNG TIN TỔNG QUAN --- */}
      <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-white/5 bg-black/40 shadow-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-[0.3em]">Official Score</span>
              {data.isForeignLanguage && <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase tracking-[0.3em]">International Mode</span>}
            </div>
            <h2 className="text-4xl md:text-6xl font-classic italic text-white leading-none">{data.songTitle}</h2>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-2">
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Narrative Arc</span>
             <p className="text-sm font-classic italic text-slate-300 leading-relaxed">"{data.narrativeArc}"</p>
           </div>
           <div className="space-y-2 border-l border-white/5 pl-10">
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Atelier Appreciation</span>
             <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{data.musicalAppreciation}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- PHẦN 2: KHUNG LỜI MỚI (CHÍNH) --- */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-6">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">New Lyrics Score</span>
            <CopyButton text={fullNewLyrics} label="Lyrics" />
          </div>
          <div className="glass-panel rounded-[3rem] p-10 md:p-16 border border-white/5 bg-[#060606] shadow-2xl min-h-[500px]">
            <div className="flex flex-col gap-12">
              {data.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-[0.5em]">{section.title}</span>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                  </div>
                  <div className="space-y-5 pl-4 md:pl-8 border-l border-white/5">
                    {section.lines.map((line, lIdx) => (
                      <p key={lIdx} className="text-xl md:text-2xl font-classic italic text-white/90 leading-tight hover:text-white transition-all">
                        {line.rewritten}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- PHẦN 3: SIDEBAR (PHIÊN ÂM & STYLE PROMPT) --- */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Box Phiên Âm */}
          {data.isForeignLanguage && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Phonetic Map</span>
                <CopyButton text={fullTransliteration} label="Phonetics" />
              </div>
              <div className="glass-panel rounded-[2rem] p-8 border border-white/5 bg-black/40 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {data.sections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                      <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">{section.title}</span>
                      <div className="space-y-2">
                        {section.lines.map((line, lIdx) => (
                          <div key={lIdx} className="space-y-1">
                            <p className="text-[10px] text-slate-500 italic opacity-50">{line.original}</p>
                            <p className="text-[11px] text-amber-500/60 font-medium italic">{line.transliteration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Box Style Prompt */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Music Style Prompt (AI)</span>
              <CopyButton text={data.musicStylePrompt} label="Prompt" />
            </div>
            <div className="glass-panel rounded-[2rem] p-8 border border-white/5 bg-emerald-500/5 shadow-inner">
              <p className="text-[12px] font-mono text-emerald-500/80 leading-relaxed select-all">
                {data.musicStylePrompt}
              </p>
              <div className="mt-6 pt-6 border-t border-emerald-500/10">
                <p className="text-[9px] text-slate-600 font-bold uppercase">Sử dụng prompt này trên Suno/Udio để tạo nhạc đúng phong cách.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LyricResult;
