import React from 'react';
import { Play, Pause, Music } from 'lucide-react';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  instrumentalUrl: string | null;
  isVocalRemoving?: boolean;
  onTogglePlayback: () => void;
  onSeek: (time: number) => void;
  onExtractVocal?: () => void;
  onToggleInstrumental?: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  currentTime,
  duration,
  instrumentalUrl,
  isVocalRemoving,
  onTogglePlayback,
  onSeek,
  onExtractVocal,
  onToggleInstrumental,
}) => {
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;

  return (
    <div className="glass-panel flex h-24 shrink-0 items-center gap-8 border-t border-white/[0.06] px-8">
      <button
        onClick={onTogglePlayback}
        className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500 shadow-2xl shadow-amber-500/30 transition-all hover:bg-amber-400 active:scale-90"
      >
        {isPlaying ? (
          <Pause className="h-7 w-7 fill-black text-black" />
        ) : (
          <Play className="ml-1 h-7 w-7 fill-black text-black" />
        )}
      </button>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <span className="font-mono text-[12px] font-black text-amber-400">
            {formatTime(currentTime)}
          </span>
          <div className="flex items-center gap-3">
            <Music className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-600">
              {instrumentalUrl ? 'Nhạc không lời' : 'Master Control Player'}
            </span>
            {instrumentalUrl ? (
              <button
                onClick={onToggleInstrumental}
                className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400 transition-colors hover:bg-emerald-500/30"
              >
                Vocal Removed ✓
              </button>
            ) : onExtractVocal ? (
              <button
                onClick={onExtractVocal}
                disabled={isVocalRemoving}
                className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-50"
              >
                {isVocalRemoving ? 'Đang tách...' : 'Tách Vocal'}
              </button>
            ) : null}
          </div>
          <span className="font-mono text-[12px] font-black text-slate-500">
            {formatTime(duration)}
          </span>
        </div>
        <div className="group relative mx-2 h-2 rounded-full bg-white/[0.06] shadow-inner">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.001"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
          />
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
            style={{ width: `${(currentTime / (duration || 100)) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 scale-0 rounded-full border-4 border-amber-500 bg-white shadow-[0_0_20px_white] transition-all group-hover:scale-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
