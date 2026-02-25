import React, { useState } from 'react';
import { RewriteResponse } from '../types';
import { UI_TIMING } from '../constants';

interface LyricResultProps {
  data: RewriteResponse | null;
}

const CopyButton: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), UI_TIMING.COPY_SUCCESS_MS);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
        copied
          ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
          : 'border-white/[0.08] bg-white/[0.04] text-slate-500 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-slate-300'
      }`}
    >
      {copied ? 'Copied ✓' : `Copy ${label}`}
    </button>
  );
};

const LyricResult: React.FC<LyricResultProps> = ({ data }) => {
  if (!data) return null;

  const fullNewLyrics = data.sections
    .map((s) => `[${s.title}]\n${s.lines.map((l) => l.rewritten).join('\n')}`)
    .join('\n\n');
  const fullTransliteration = data.sections
    .map((s) => `[${s.title}]\n${s.lines.map((l) => l.transliteration || '').join('\n')}`)
    .join('\n\n');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 mt-12 flex w-full max-w-5xl flex-col gap-12 px-4 pb-40 duration-1000">
      {/* --- PHẦN 1: THÔNG TIN TỔNG QUAN --- */}
      <div className="glass-panel shadow-3xl rounded-[2.5rem] border border-white/[0.08] p-8 md:p-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.3em] text-amber-400">
                Official Score
              </span>
              {data.isForeignLanguage && (
                <span className="rounded border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.3em] text-violet-400">
                  International Mode
                </span>
              )}
            </div>
            <h2 className="font-classic text-4xl italic leading-none text-white md:text-6xl">
              {data.songTitle}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-10 border-t border-white/[0.06] pt-8 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
              Narrative Arc
            </span>
            <p className="font-classic text-sm italic leading-relaxed text-slate-300">
              "{data.narrativeArc}"
            </p>
          </div>
          <div className="space-y-2 border-l border-white/[0.06] pl-10">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
              Atelier Appreciation
            </span>
            <p className="text-[11px] font-medium italic leading-relaxed text-slate-400">
              {data.musicalAppreciation}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* --- PHẦN 2: KHUNG LỜI MỚI --- */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="flex items-center justify-between px-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
              New Lyrics Score
            </span>
            <CopyButton text={fullNewLyrics} label="Lyrics" />
          </div>
          <div className="glass-panel min-h-[500px] rounded-[3rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-10 shadow-2xl md:p-16">
            <div className="flex flex-col gap-12">
              {data.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-amber-500/60">
                      {section.title}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/[0.06]"></div>
                  </div>
                  <div className="space-y-5 border-l border-amber-500/20 pl-4 md:pl-8">
                    {section.lines.map((line, lIdx) => (
                      <p
                        key={lIdx}
                        className="font-classic text-xl italic leading-tight text-slate-300 transition-all hover:text-white md:text-2xl"
                      >
                        {line.rewritten}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- PHẦN 3: SIDEBAR --- */}
        <div className="flex flex-col gap-8 lg:col-span-4">
          {/* Phiên Âm */}
          {data.isForeignLanguage && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-400">
                  Phonetic Map
                </span>
                <CopyButton text={fullTransliteration} label="Phonetics" />
              </div>
              <div className="glass-panel custom-scrollbar max-h-[400px] overflow-y-auto rounded-[2rem] border border-white/[0.08] p-8">
                <div className="space-y-6">
                  {data.sections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                        {section.title}
                      </span>
                      <div className="space-y-2">
                        {section.lines.map((line, lIdx) => (
                          <div key={lIdx} className="space-y-1">
                            <p className="text-[10px] italic text-slate-600 opacity-70">
                              {line.original}
                            </p>
                            <p className="text-[11px] font-medium italic text-amber-400">
                              {line.transliteration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Music Style Prompt */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
                Music Style Prompt (AI)
              </span>
              <CopyButton text={data.musicStylePrompt} label="Prompt" />
            </div>
            <div className="glass-panel rounded-[2rem] border border-emerald-500/15 bg-emerald-500/[0.05] p-8">
              <p className="select-all font-mono text-[12px] leading-relaxed text-emerald-300">
                {data.musicStylePrompt}
              </p>
              <div className="mt-6 border-t border-emerald-500/10 pt-6">
                <p className="text-[9px] font-bold uppercase text-slate-600">
                  Sử dụng prompt này trên Suno/Udio để tạo nhạc đúng phong cách.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricResult;
