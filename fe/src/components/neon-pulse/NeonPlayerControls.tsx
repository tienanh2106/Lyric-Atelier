import { useEffect, useState } from 'react';
import { Play, Pause, Maximize2 } from 'lucide-react';

interface NeonPlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
  isRecording: boolean;
  onToggleRecord: () => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const NeonPlayerControls = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  onFullscreen,
  isRecording,
  onToggleRecord,
}: NeonPlayerControlsProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (duration > 0) setProgress((currentTime / duration) * 100);
  }, [currentTime, duration]);

  return (
    <div className="z-30 flex w-full flex-col items-center bg-gradient-to-t from-black/90 via-black/50 to-transparent px-8 pb-8 pt-12">
      <div className="flex w-full max-w-4xl items-center gap-4 text-white/90">
        <button
          onClick={onTogglePlay}
          className="transition-colors hover:text-cyan-400 focus:outline-none"
        >
          {isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>

        <span className="w-10 text-right font-mono text-xs">{formatTime(currentTime)}</span>

        <div className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/20">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div
            className="relative h-full rounded-full bg-cyan-400"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_10px_rgba(0,255,255,0.8)] transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        <span className="w-10 font-mono text-xs">{formatTime(duration)}</span>

        <button
          onClick={onToggleRecord}
          className={`flex items-center gap-1 rounded border px-2 py-1 transition-all ${isRecording ? 'border-red-500 bg-red-500/20' : 'border-white/10 bg-white/10 hover:bg-white/20'}`}
        >
          <div className={`h-2 w-2 rounded-full bg-red-500 ${isRecording ? 'animate-ping' : ''}`} />
          <span
            className={`text-[10px] font-bold tracking-widest ${isRecording ? 'text-red-400' : 'text-white/70'}`}
          >
            REC
          </span>
        </button>

        <button onClick={onFullscreen} className="transition-colors hover:text-cyan-400">
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};
