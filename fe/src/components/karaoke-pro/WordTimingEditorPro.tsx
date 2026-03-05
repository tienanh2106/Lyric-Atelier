import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { ProLine, ProWord, ProTextStyle } from '../../types/karaokeProTypes';

interface Props {
  lines: ProLine[];
  style: ProTextStyle;
  currentTime: number;
  onWordEdit: (lineId: string, wordIdx: number, updates: Partial<ProWord>) => void;
  onGlobalOffset: (offset: number) => void;
}

export const WordTimingEditorPro: React.FC<Props> = ({
  lines,
  style,
  currentTime,
  onWordEdit,
  onGlobalOffset,
}) => {
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null);

  const fmt = (s: number) => s.toFixed(2);
  const DELTA = 0.05;

  return (
    <div className="space-y-4 p-4">
      {/* Global offset */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Global Offset
          </span>
          <span className="font-mono text-[11px] text-violet-400">{style.globalOffset.toFixed(2)}s</span>
        </div>
        <input
          type="range"
          min={-5} max={5} step={0.05}
          value={style.globalOffset}
          onChange={(e) => onGlobalOffset(parseFloat(e.target.value))}
          className="w-full accent-violet-500"
        />
        <div className="mt-1 flex justify-between text-[9px] text-slate-700">
          <span>-5s (sớm hơn)</span>
          <span>+5s (muộn hơn)</span>
        </div>
      </div>

      {/* Lines list */}
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
        {lines.length} dòng — click để mở chỉnh từng từ
      </div>

      <div className="space-y-2 max-h-[calc(100vh-28rem)] overflow-y-auto pr-1">
        {lines.map((line) => {
          const isExpanded = expandedLineId === line.id;
          const lineText = line.words.map((w) => w.text).join(' ');
          const isActive = line.words.some(
            (w) => w.startTime <= currentTime && w.endTime >= currentTime
          );

          return (
            <div
              key={line.id}
              className={`overflow-hidden rounded-xl border transition-all ${
                isActive
                  ? 'border-violet-500/40 bg-violet-500/5'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              {/* Line header */}
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                onClick={() => setExpandedLineId(isExpanded ? null : line.id)}
              >
                {isActive && (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                )}
                <span className="flex-1 truncate text-[11px] font-bold text-slate-300">{lineText}</span>
                <span className="shrink-0 font-mono text-[9px] text-slate-600">
                  {fmt(line.words[0]?.startTime ?? 0)}s
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3 shrink-0 text-slate-600" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0 text-slate-600" />
                )}
              </button>

              {/* Word editor */}
              {isExpanded && (
                <div className="border-t border-white/[0.06] px-4 py-3 space-y-3">
                  {line.words.map((word, wi) => {
                    const isWordActive = word.startTime <= currentTime && word.endTime > currentTime;
                    return (
                      <div
                        key={wi}
                        className={`rounded-lg p-2 ${isWordActive ? 'bg-violet-500/10' : ''}`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`text-[11px] font-bold ${isWordActive ? 'text-violet-300' : 'text-slate-400'}`}>
                            {word.text}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Start time */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onWordEdit(line.id, wi, { startTime: Math.max(0, word.startTime - DELTA) })}
                              className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 hover:bg-white/10"
                            >
                              <Minus className="h-2.5 w-2.5 text-slate-400" />
                            </button>
                            <span className="flex-1 text-center font-mono text-[10px] text-slate-500">
                              {fmt(word.startTime)}
                            </span>
                            <button
                              onClick={() => onWordEdit(line.id, wi, { startTime: word.startTime + DELTA })}
                              className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 hover:bg-white/10"
                            >
                              <Plus className="h-2.5 w-2.5 text-slate-400" />
                            </button>
                            <span className="text-[9px] text-slate-700 ml-0.5">start</span>
                          </div>
                          {/* End time */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onWordEdit(line.id, wi, { endTime: Math.max(word.startTime + 0.05, word.endTime - DELTA) })}
                              className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 hover:bg-white/10"
                            >
                              <Minus className="h-2.5 w-2.5 text-slate-400" />
                            </button>
                            <span className="flex-1 text-center font-mono text-[10px] text-slate-500">
                              {fmt(word.endTime)}
                            </span>
                            <button
                              onClick={() => onWordEdit(line.id, wi, { endTime: word.endTime + DELTA })}
                              className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 hover:bg-white/10"
                            >
                              <Plus className="h-2.5 w-2.5 text-slate-400" />
                            </button>
                            <span className="text-[9px] text-slate-700 ml-0.5">end</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
