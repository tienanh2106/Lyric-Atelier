import React, { useState, useEffect } from 'react';
import { ProStep } from '../types/karaokeProTypes';
import { useKaraokePro } from '../hooks/useKaraokePro';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useVocalRemoval } from '../hooks/useVocalRemoval';
import { useKaraokeProExport } from '../hooks/useKaraokeProExport';
import { ProcessingOverlay } from '../components/karaoke/ProcessingOverlay';
import { AudioPlayerBar } from '../components/karaoke/AudioPlayerBar';
import { UploadStepPro } from '../components/karaoke-pro/UploadStepPro';
import { EditorSidebarPro } from '../components/karaoke-pro/EditorSidebarPro';
import KaraokeProRenderer from '../components/karaoke-pro/KaraokeProRenderer';
import { RefreshCw } from 'lucide-react';

const KaraokeProPage: React.FC = () => {
  const [step, setStep] = useState<ProStep>(1);

  const {
    project,
    handleAudioUpload,
    handleBgUpload,
    handleStartSync,
    handleStyleUpdate,
    handleWordEdit,
    handleGlobalOffset,
    handleLyricsChange,
    isProcessing,
    processingMessage,
    error,
    setError,
  } = useKaraokePro({ onSyncSuccess: () => setStep(2) });

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

  const {
    isProcessing: isVocalProcessing,
    instrumentalUrl,
    useInstrumental,
    process: processVocal,
    toggle: toggleVocal,
    error: vocalError,
  } = useVocalRemoval(project.audioFile);

  const audioSrc = useInstrumental && instrumentalUrl ? instrumentalUrl : (project.audioUrl ?? '');

  const { isExporting, exportProgress, handleExport, handleExportMP4 } = useKaraokeProExport(
    project,
    instrumentalUrl,
    setError
  );

  // Load extra Google Fonts for Pro
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Lexend:wght@400;700;900&family=Lora:wght@400;700&family=Playfair+Display:wght@400;700;900&family=Dancing+Script:wght@400;700&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleReset = () => {
    setStep(1);
    setError(null);
    resetAudio();
  };

  // ─── Step 1: Upload ───────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <>
        <ProcessingOverlay isProcessing={isProcessing} message={processingMessage} />
        <UploadStepPro
          project={project}
          onAudioUpload={handleAudioUpload}
          onBgUpload={handleBgUpload}
          onLyricsChange={handleLyricsChange}
          onStartSync={() => void handleStartSync()}
          isProcessing={isProcessing}
          error={error}
        />
      </>
    );
  }

  // ─── Steps 2–4: Editor ────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050709] text-slate-100">
      <ProcessingOverlay isProcessing={isProcessing} message={processingMessage} />

      {/* Toolbar */}
      <div className="glass-panel z-40 flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-8 backdrop-blur-xl">
        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
          Karaoke <span className="text-violet-400">Pro</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.05] px-3 py-1.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
              {project.lines.length} dòng &middot;{' '}
              {project.lines.reduce((a, l) => a + l.words.length, 0)} từ
            </span>
          </div>
          <RefreshCw
            className="h-4 w-4 cursor-pointer text-slate-500 transition-all hover:rotate-180 hover:text-violet-400"
            onClick={handleReset}
          />
        </div>
      </div>

      {/* Main: canvas + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas preview */}
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#050a14] p-6">
          <div className="group relative aspect-video w-full max-w-[1080px] overflow-hidden rounded-[2rem] border border-white/[0.06] bg-black shadow-2xl">
            <KaraokeProRenderer currentTime={currentTime} project={project} />
            {/* Time overlay */}
            <div className="absolute left-6 top-6 z-40 flex scale-95 items-center gap-4 rounded-xl border border-white/10 bg-black/60 px-4 py-2 opacity-0 backdrop-blur-2xl transition-all group-hover:scale-100 group-hover:opacity-100">
              <div className="rec-dot h-3 w-3 rounded-full bg-red-600 shadow-[0_0_15px_red]" />
              <span className="font-mono text-[13px] font-black tracking-widest text-white">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
              </span>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <EditorSidebarPro
          project={project}
          step={step}
          currentTime={currentTime}
          onStyleUpdate={handleStyleUpdate}
          onWordEdit={handleWordEdit}
          onGlobalOffset={handleGlobalOffset}
          onSetStep={setStep}
          isVocalProcessing={isVocalProcessing}
          instrumentalUrl={instrumentalUrl}
          useInstrumental={useInstrumental}
          vocalError={vocalError}
          onProcessVocal={() => void processVocal()}
          onToggleVocal={toggleVocal}
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
        instrumentalUrl={useInstrumental ? instrumentalUrl : null}
        onTogglePlayback={togglePlayback}
        onSeek={seek}
      />

      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />
    </div>
  );
};

export default KaraokeProPage;
