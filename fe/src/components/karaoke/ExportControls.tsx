import React from 'react';

interface ExportControlsProps {
  isExporting: boolean;
  exportProgress: number;
  onExportWebm: () => void;
  onExportMp4: () => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  isExporting,
  exportProgress,
  onExportWebm,
  onExportMp4,
}) => {
  return (
    <div className="glass-panel flex h-20 items-center gap-3 border-t border-white/[0.06] px-6 backdrop-blur-2xl">
      <button
        onClick={onExportWebm}
        disabled={isExporting}
        title="WebM — mọi trình duyệt, real-time"
        className="flex-1 rounded-[2rem] border border-amber-500/40 bg-amber-500/10 py-3.5 text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 transition-all hover:bg-amber-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExporting ? `${exportProgress}%` : 'WebM'}
      </button>
      <button
        onClick={onExportMp4}
        disabled={isExporting}
        title="MP4 H.264 — Chrome 94+, render offline nhanh"
        className="flex-1 rounded-[2rem] bg-amber-500 py-3.5 text-[9px] font-black uppercase tracking-[0.3em] text-black shadow-2xl shadow-amber-500/30 transition-all hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isExporting ? `${exportProgress}%` : 'MP4 ⚡'}
      </button>
    </div>
  );
};
