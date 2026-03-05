import React from 'react';
import { Download, Film, Zap } from 'lucide-react';

interface Props {
  isExporting: boolean;
  exportProgress: number;
  onExportWebm: () => void;
  onExportMp4: () => void;
}

export const ExportStepPro: React.FC<Props> = ({ isExporting, exportProgress, onExportWebm, onExportMp4 }) => (
  <div className="space-y-5 p-4">
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
      Xuất Video
    </div>

    {isExporting ? (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Đang xuất...
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
            style={{ width: `${exportProgress}%` }}
          />
        </div>
        <p className="text-center font-mono text-[13px] font-black text-amber-400">
          {exportProgress}%
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {/* WebM — real-time */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Film className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-white">WebM</p>
              <p className="text-[10px] text-slate-600">Real-time capture · VP9+Opus</p>
            </div>
            <button
              onClick={onExportWebm}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-400 ring-1 ring-amber-500/20 transition-all hover:bg-amber-500/25"
            >
              <Download className="h-3.5 w-3.5" /> Xuất
            </button>
          </div>
        </div>

        {/* MP4 — fast encode */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <Zap className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-white">MP4</p>
              <p className="text-[10px] text-slate-600">Nhanh hơn real-time · H.264+AAC</p>
            </div>
            <button
              onClick={onExportMp4}
              className="flex items-center gap-1.5 rounded-xl bg-violet-500/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-violet-400 ring-1 ring-violet-500/20 transition-all hover:bg-violet-500/25"
            >
              <Download className="h-3.5 w-3.5" /> Xuất
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">Lưu ý</div>
      <ul className="space-y-1 text-[11px] text-slate-600">
        <li>• WebM: Ghi real-time, cần đợi bằng thời lượng nhạc</li>
        <li>• MP4: Encode nhanh không real-time, cần Chrome 94+ (VideoEncoder API)</li>
        <li>• Audio: dùng nhạc không lời nếu đã tách ở bước Vocal</li>
      </ul>
    </div>
  </div>
);
