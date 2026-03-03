import React, { useState, useRef } from 'react';
import { AppStep, KaraokeSegment } from '../types/karaoke';
import { useKaraokeProject } from '../hooks/useKaraokeProject';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useKaraokeExport } from '../hooks/useKaraokeExport';
import { KaraokeRenderer } from '../components/karaoke/KaraokeRenderer';
import { ProcessingOverlay } from '../components/karaoke/ProcessingOverlay';
import { StepOneUpload } from '../components/karaoke/StepOneUpload';
import { EditorSidebar } from '../components/karaoke/EditorSidebar';
import { AudioPlayerBar } from '../components/karaoke/AudioPlayerBar';
import { RefreshCw, Maximize2 } from 'lucide-react';

const KaraokeStudioPage: React.FC = () => {
  const [step, setStep] = useState<AppStep>(1);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  const {
    currentProject,
    setCurrentProject,
    handleFileUpload,
    handleStartSync,
    handleStyleUpdate,
    isProcessing,
    processingMessage,
    error,
    setError,
  } = useKaraokeProject({ onSyncSuccess: () => setStep(2) });

  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    togglePlayback,
    reset: resetAudio,
    seek,
    handleLoadedMetadata,
  } = useAudioPlayer();

  const { isExporting, exportProgress, handleExport, handleExportMP4 } = useKaraokeExport(
    currentProject,
    setError
  );

  const handleReset = () => {
    setStep(1);
    setError(null);
    resetAudio();
  };

  // ─── Step 1: Upload & Setup ───────────────────────────────────────────────
  if (step === 1) {
    return (
      <>
        <ProcessingOverlay isProcessing={isProcessing} message={processingMessage} />
        <StepOneUpload
          currentProject={currentProject}
          onFileUpload={handleFileUpload}
          onStyleUpdate={handleStyleUpdate}
          onLyricsChange={(text) => setCurrentProject((p) => ({ ...p, rawLyrics: text }))}
          onStartSync={() => void handleStartSync()}
          isProcessing={isProcessing}
          error={error}
        />
      </>
    );
  }

  // ─── Step 2: Studio Editor ────────────────────────────────────────────────
  return (
    <div className="flex flex-col text-slate-100">
      <ProcessingOverlay isProcessing={isProcessing} message={processingMessage} />

      {/* Studio toolbar */}
      <div className="glass-panel z-40 flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-8 backdrop-blur-xl">
        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
          Studio <span className="text-amber-400">Professional</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.05] px-3 py-1.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
              AI Engine Active
            </span>
          </div>
          <RefreshCw
            className="h-4 w-4 cursor-pointer text-slate-500 transition-all hover:rotate-180 hover:text-amber-400"
            onClick={handleReset}
          />
          <Maximize2 className="h-4 w-4 cursor-pointer text-slate-500 hover:text-white" />
        </div>
      </div>

      {/* Main studio area */}
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 13rem)' }}>
        {/* Canvas preview */}
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#050a14] p-6">
          <div className="shadow-3xl group relative aspect-video w-full max-w-[1080px] overflow-hidden rounded-[2rem] border border-white/[0.06] bg-black">
            <KaraokeRenderer
              currentTime={currentTime}
              project={currentProject}
              isMaximized={true}
              exportMode={isExporting}
              exportCanvasRef={exportCanvasRef}
            />
            <div className="absolute left-6 top-6 z-40 flex scale-95 items-center gap-4 rounded-xl border border-white/10 bg-black/60 px-4 py-2 opacity-0 backdrop-blur-2xl transition-all group-hover:scale-100 group-hover:opacity-100">
              <div className="rec-dot h-3 w-3 rounded-full bg-red-600 shadow-[0_0_15px_red]"></div>
              <span className="font-mono text-[13px] font-black tracking-widest text-white">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
              </span>
            </div>
          </div>
        </main>

        {/* Right sidebar */}
        <EditorSidebar
          currentProject={currentProject}
          onFileUpload={handleFileUpload}
          onStyleUpdate={handleStyleUpdate}
          onSegmentsUpdate={(s: KaraokeSegment[]) =>
            setCurrentProject((p) => ({ ...p, segments: s }))
          }
          currentTime={currentTime}
          onReSync={() => void handleStartSync()}
          isExporting={isExporting}
          exportProgress={exportProgress}
          onExportWebm={() => void handleExport()}
          onExportMp4={() => void handleExportMP4()}
        />
      </div>

      {/* Audio player */}
      <AudioPlayerBar
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        instrumentalUrl={currentProject.instrumentalUrl}
        onTogglePlayback={togglePlayback}
        onSeek={seek}
      />

      {/* Canvas ẩn dùng cho composite export */}
      <canvas ref={exportCanvasRef} width={1920} height={1080} className="hidden" />

      <audio
        ref={audioRef}
        src={currentProject.instrumentalUrl || currentProject.audioUrl || ''}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />
    </div>
  );
};

export default KaraokeStudioPage;
