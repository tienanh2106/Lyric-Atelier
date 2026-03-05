import React, { useRef } from 'react';
import { Music, Image, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { ProProjectData } from '../../types/karaokeProTypes';

interface UploadStepProProps {
  project: ProProjectData;
  onAudioUpload: (file: File) => void;
  onBgUpload: (file: File) => void;
  onLyricsChange: (text: string) => void;
  onStartSync: () => void;
  isProcessing: boolean;
  error: string | null;
}

export const UploadStepPro: React.FC<UploadStepProProps> = ({
  project,
  onAudioUpload,
  onBgUpload,
  onLyricsChange,
  onStartSync,
  isProcessing,
  error,
}) => {
  const audioRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  const canSync = !!project.audioFile && !!project.rawLyrics.trim();

  return (
    <div className="min-h-screen bg-[#080910] text-slate-100 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.5em] text-violet-400">
          Karaoke Pro
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white">
          Bước 1 — <span className="text-violet-400">Upload & Setup</span>
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Tải nhạc và lời bài hát, AI sẽ đồng bộ từng từ theo nhịp phách.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Audio upload */}
        <div
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
          onClick={() => audioRef.current?.click()}
        >
          <input
            ref={audioRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAudioUpload(f);
            }}
          />
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/20">
              <Music className="h-7 w-7 text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-violet-400/70">
                Bước 1
              </div>
              <h3 className="text-lg font-black uppercase text-white">Upload Nhạc</h3>
              <p className="mt-1 text-sm text-slate-500">
                {project.audioFile
                  ? project.audioFile.name
                  : 'MP3, WAV, M4A, FLAC — AI sẽ tự trích xuất lời'}
              </p>
            </div>
            {project.audioFile && (
              <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                Đã tải
              </div>
            )}
          </div>
        </div>

        {/* Background upload */}
        <div
          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 transition-all hover:border-amber-500/20 hover:bg-amber-500/5"
          onClick={() => bgRef.current?.click()}
        >
          <input
            ref={bgRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onBgUpload(f);
            }}
          />
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
              <Image className="h-7 w-7 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">
                Tuỳ chọn
              </div>
              <h3 className="text-lg font-black uppercase text-white">Background</h3>
              <p className="mt-1 text-sm text-slate-500">
                {project.backgroundFile
                  ? project.backgroundFile.name
                  : 'Ảnh hoặc video nền — hỗ trợ brightness/contrast/blur filters'}
              </p>
            </div>
            {project.backgroundFile && (
              <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                Đã tải
              </div>
            )}
          </div>
        </div>

        {/* Lyrics textarea */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Lời Bài Hát
            </span>
            {project.rawLyrics && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                {project.rawLyrics.split('\n').filter(Boolean).length} dòng
              </span>
            )}
          </div>
          <textarea
            className="w-full resize-none rounded-2xl border border-white/[0.06] bg-black/30 p-4 font-mono text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
            rows={8}
            placeholder="Dán lời bài hát vào đây...&#10;AI sẽ tự động đồng bộ từng từ theo nhịp phách"
            value={project.rawLyrics}
            onChange={(e) => onLyricsChange(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Start Sync button */}
        <button
          onClick={onStartSync}
          disabled={!canSync || isProcessing}
          className="group flex w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-violet-600 to-violet-500 px-8 py-5 text-[13px] font-black uppercase tracking-widest text-white shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <Sparkles className="h-5 w-5" />
          {isProcessing ? 'AI đang xử lý...' : 'Đồng Bộ Nhịp Phách (AI)'}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="text-center text-[11px] text-slate-600">
          Sử dụng Gemini 2.5 Pro · 10 credits transcribe + 15 credits sync
        </p>
      </div>
    </div>
  );
};
