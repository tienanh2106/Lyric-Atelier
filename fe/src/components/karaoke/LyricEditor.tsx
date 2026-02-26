import { useEffect, useRef, useState } from 'react';
import { KaraokeSegment } from '../../types/karaoke';
import { Clock, Trash2, Plus, ChevronUp, ChevronDown, Wand2, CheckCircle2 } from 'lucide-react';

interface Props {
  segments: KaraokeSegment[];
  currentTime: number;
  onUpdate: (segments: KaraokeSegment[]) => void;
  onReSync?: () => void;
}

export const LyricEditor: React.FC<Props> = ({ segments, currentTime, onUpdate, onReSync }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const activeIdx = segments.findIndex(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );
    if (activeIdx !== -1 && scrollRef.current) {
      const activeEl = scrollRef.current.children[activeIdx] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, segments]);

  const markAsModified = (id: string) => {
    setModifiedIds((prev) => new Set(prev).add(id));
  };

  const updateSegment = (id: string, field: keyof KaraokeSegment, value: unknown) => {
    markAsModified(id);
    onUpdate(segments.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const confirmUpdate = (id: string) => {
    setModifiedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const nudgeSegment = (id: string, amount: number) => {
    markAsModified(id);
    onUpdate(
      segments.map((s) => {
        if (s.id === id) {
          const newStart = Math.max(0, s.startTime + amount);
          const newEnd = Math.max(newStart + 0.1, s.endTime + amount);
          const newWords = s.words?.map((w) => ({
            ...w,
            startTime: Math.max(0, w.startTime + amount),
            endTime: Math.max(0, w.endTime + amount),
          }));
          return { ...s, startTime: newStart, endTime: newEnd, words: newWords };
        }
        return s;
      })
    );
  };

  const adjustSpeed = (id: string, multiplier: number) => {
    markAsModified(id);
    onUpdate(
      segments.map((s) => {
        if (s.id === id) {
          const duration = s.endTime - s.startTime;
          const newDuration = duration * multiplier;
          const newEnd = s.startTime + newDuration;
          const newWords = s.words?.map((w) => {
            const wordRelStart = (w.startTime - s.startTime) / duration;
            const wordRelEnd = (w.endTime - s.startTime) / duration;
            return {
              ...w,
              startTime: s.startTime + wordRelStart * newDuration,
              endTime: s.startTime + wordRelEnd * newDuration,
            };
          });
          return { ...s, endTime: newEnd, words: newWords };
        }
        return s;
      })
    );
  };

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/[0.08] p-5 shadow-2xl">
      <div className="mb-5 flex shrink-0 items-center justify-between">
        <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
          <Clock className="h-4 w-4" />
          MASTER TIMELINE & SPEED
        </h3>
        <div className="flex gap-2">
          {onReSync && (
            <button
              onClick={onReSync}
              className="rounded-lg bg-white/[0.05] p-1.5 text-white transition-all hover:bg-amber-500"
              title="Phân tích lại"
            >
              <Wand2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => {
              const lastEnd = segments.length > 0 ? segments[segments.length - 1].endTime : 0;
              onUpdate([
                ...segments,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  text: 'Dòng mới',
                  startTime: lastEnd + 1,
                  endTime: lastEnd + 5,
                  words: [],
                },
              ]);
            }}
            className="rounded-lg bg-amber-500 p-1.5 text-black transition-all hover:bg-amber-400"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-1">
        {segments.map((segment) => {
          const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
          const isModified = modifiedIds.has(segment.id);
          const duration = segment.endTime - segment.startTime;

          return (
            <div
              key={segment.id}
              className={`rounded-2xl border p-4 transition-all duration-300 ${
                isActive
                  ? 'scale-[1.01] border-amber-500/50 bg-amber-500/10 shadow-xl'
                  : 'border-white/[0.06] bg-white/[0.03]'
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <input
                  className={`flex-1 bg-transparent text-xs font-bold outline-none ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                  value={segment.text}
                  onChange={(e) => updateSegment(segment.id, 'text', e.target.value)}
                />
                {isModified && (
                  <button
                    onClick={() => confirmUpdate(segment.id)}
                    className="flex animate-pulse items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/20 px-2 py-1 text-emerald-400 transition-all hover:bg-emerald-600 hover:text-white"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-[8px] font-black uppercase">Cập nhật</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-[8px] font-black uppercase tracking-tighter text-slate-500">
                    Bắt đầu
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 rounded-lg bg-black/40 px-2 py-1 font-mono text-[10px] font-bold text-amber-300">
                      {segment.startTime.toFixed(2)}s
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => nudgeSegment(segment.id, -0.1)}
                        className="rounded-md bg-white/[0.05] p-1 hover:bg-white/[0.1]"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => nudgeSegment(segment.id, 0.1)}
                        className="rounded-md bg-white/[0.05] p-1 hover:bg-white/[0.1]"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[8px] font-black uppercase tracking-tighter text-slate-500">
                    Tốc độ ({duration.toFixed(1)}s)
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => adjustSpeed(segment.id, 0.9)}
                      className="flex-1 rounded-md bg-white/[0.05] py-1 text-[8px] font-black uppercase hover:bg-emerald-600"
                    >
                      Nhanh
                    </button>
                    <button
                      onClick={() => adjustSpeed(segment.id, 1.1)}
                      className="flex-1 rounded-md bg-white/[0.05] py-1 text-[8px] font-black uppercase hover:bg-amber-600"
                    >
                      Chậm
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end border-t border-white/[0.06] pt-3">
                <button
                  onClick={() => onUpdate(segments.filter((s) => s.id !== segment.id))}
                  className="text-slate-600 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
