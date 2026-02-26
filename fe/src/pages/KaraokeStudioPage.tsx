import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppStep, ProjectData, KaraokeSegment, TextStyle } from '../types/karaoke';
import { DEFAULT_STYLE, FONTS } from '../constants/karaoke';
import { transcribeAudioForKaraoke, syncKaraokeWithAPI } from '../services/karaokeService';
import { KaraokeRenderer } from '../components/karaoke/KaraokeRenderer';
import { LyricEditor } from '../components/karaoke/LyricEditor';
import {
  Music,
  Play,
  Pause,
  Palette,
  Sparkles,
  FileText,
  Type,
  ChevronRight,
  Scissors,
  Image as ImageIcon,
  RefreshCw,
  Maximize2,
  Brush,
  Ghost,
  Activity,
  Layout,
  Heart,
  Star,
  Disc,
  CloudRain,
  Wind,
  Droplets,
  Upload,
  Settings,
  BrainCircuit,
} from 'lucide-react';
import { Textarea } from '@/components/ui/Input';

const KaraokeStudioPage: React.FC = () => {
  const [step, setStep] = useState<AppStep>(1);
  const [activeTab, setActiveTab] = useState<'typography' | 'appearance' | 'vfx' | 'lyrics'>(
    'typography'
  );

  const [currentProject, setCurrentProject] = useState<ProjectData>({
    backgroundFile: null,
    backgroundUrl: null,
    backgroundType: null,
    audioFile: null,
    audioUrl: null,
    logoFile: null,
    rawLyrics: '',
    segments: [],
    style: { ...DEFAULT_STYLE },
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Đang chuẩn bị...');
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number | null>(null);

  const syncClock = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      setCurrentTime(audioRef.current.currentTime);
    }
    rafRef.current = requestAnimationFrame(syncClock);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(syncClock);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [syncClock]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'bg' | 'audio' | 'logo'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    if (type === 'bg') {
      setCurrentProject((prev) => ({
        ...prev,
        backgroundFile: file,
        backgroundUrl: url,
        backgroundType: file.type.startsWith('video') ? 'video' : 'image',
      }));
    } else if (type === 'audio') {
      setCurrentProject((prev) => ({ ...prev, audioFile: file, audioUrl: url }));
      setIsProcessing(true);
      setProcessingMessage('AI đang trích xuất lời nhạc...');
      setError(null);
      transcribeAudioForKaraoke(file)
        .then((text) => setCurrentProject((prev) => ({ ...prev, rawLyrics: text })))
        .catch((err) => {
          console.error(err);
          setError('Không thể trích xuất lời. Vui lòng dán lời thủ công.');
        })
        .finally(() => setIsProcessing(false));
    } else if (type === 'logo') {
      setCurrentProject((prev) => ({
        ...prev,
        logoFile: file,
        style: { ...prev.style, logoUrl: url },
      }));
    }
  };

  const handleStartSync = async () => {
    if (!currentProject.audioFile || !currentProject.rawLyrics) {
      setError('Vui lòng cung cấp đầy đủ nhạc và lời bài hát.');
      return;
    }
    setIsProcessing(true);
    setProcessingMessage('đang phân tích sóng âm...');
    setError(null);
    try {
      const syncedSegments = await syncKaraokeWithAPI(
        currentProject.audioFile,
        currentProject.rawLyrics
      );
      if (syncedSegments && syncedSegments.length > 0) {
        setCurrentProject((prev) => ({ ...prev, segments: syncedSegments }));
        setStep(2);
      } else {
        throw new Error('Không thể đồng bộ lời nhạc.');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi đồng bộ nhịp phách. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setCurrentTime(0);
    setIsPlaying(false);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleStyleUpdate = useCallback((key: keyof TextStyle, value: unknown) => {
    setCurrentProject((prev) => ({ ...prev, style: { ...prev.style, [key]: value } }));
  }, []);

  // ─── Step 1: Upload & Setup ───────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex min-h-screen flex-col overflow-hidden text-slate-100">
        {/* Processing overlay */}
        {isProcessing && (
          <div className="bg-[#080910]/98 animate-fadeIn fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-10">
              <BrainCircuit className="h-24 w-24 animate-pulse text-amber-500" />
              <Sparkles className="absolute -right-2 -top-2 h-8 w-8 animate-bounce text-amber-300" />
            </div>
            <h2 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-4xl font-black uppercase italic tracking-tighter text-transparent">
              {processingMessage}
            </h2>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
              AI đang tính toán nhịp phách (Word-Sync)...
            </p>
          </div>
        )}

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-12 p-8">
          <div className="grid w-full max-w-6xl grid-cols-12 gap-10">
            {/* Left: Upload panel */}
            <div className="col-span-12 space-y-8 lg:col-span-5">
              <div className="glass-panel shadow-3xl space-y-8 rounded-[3rem] border border-white/[0.08] p-10 backdrop-blur-xl">
                <div className="space-y-5">
                  <h3 className="flex items-center gap-3 border-b border-white/[0.06] pb-3 text-[11px] font-black uppercase tracking-widest text-amber-500">
                    <Settings className="h-4 w-4" /> Thông tin tác phẩm
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="px-3 text-[9px] font-black uppercase text-slate-500">
                        Tên bài hát
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-amber-500"
                        placeholder="VD: Để Mọi Thứ Sang Một Bên..."
                        value={currentProject.style.introTitle}
                        onChange={(e) => handleStyleUpdate('introTitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="px-3 text-[9px] font-black uppercase text-slate-500">
                        Ca sĩ trình bày
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-amber-500"
                        placeholder="VD: Mỹ Tâm..."
                        value={currentProject.style.introArtist}
                        onChange={(e) => handleStyleUpdate('introArtist', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="border-b border-white/[0.06] pb-3 text-[11px] font-black uppercase tracking-widest text-amber-500">
                    Tài nguyên đa phương tiện
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <label className="group flex cursor-pointer items-center gap-5 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.03] p-6 transition-all hover:border-amber-500 hover:bg-amber-500/5">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileUpload(e, 'audio')}
                        className="hidden"
                      />
                      <div className="rounded-xl bg-white/[0.06] p-3 transition-all group-hover:bg-amber-500 group-hover:text-black">
                        <Music className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate text-[12px] font-black">
                          {currentProject.audioFile
                            ? currentProject.audioFile.name
                            : 'Tải lên nhạc (MP3, WAV)'}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          Audio Master
                        </span>
                      </div>
                    </label>

                    <label className="group flex cursor-pointer items-center gap-5 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.03] p-6 transition-all hover:border-amber-500 hover:bg-amber-500/5">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, 'bg')}
                        className="hidden"
                      />
                      <div className="rounded-xl bg-white/[0.06] p-3 transition-all group-hover:bg-amber-500 group-hover:text-black">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate text-[12px] font-black">
                          {currentProject.backgroundFile
                            ? currentProject.backgroundFile.name
                            : 'Tải lên hình nền / video'}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          Background Visual
                        </span>
                      </div>
                    </label>

                    <label className="group flex cursor-pointer items-center gap-5 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.03] p-6 transition-all hover:border-amber-500 hover:bg-amber-500/5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        className="hidden"
                      />
                      <div className="rounded-xl bg-white/[0.06] p-3 transition-all group-hover:bg-amber-500 group-hover:text-black">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate text-[12px] font-black">
                          {currentProject.logoFile
                            ? currentProject.logoFile.name
                            : 'Tải lên Logo thương hiệu'}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                          Branding Logo
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Lyrics & Sync */}
            <div className="col-span-12 flex flex-col gap-8 lg:col-span-7">
              <div
                className="glass-panel shadow-3xl group relative flex-1 overflow-hidden rounded-[3rem] border border-white/[0.08] p-12"
                style={{ minHeight: '320px' }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Lời bài hát (Full Script)
                  </span>
                </div>
                <Textarea
                  className="resize-y"
                  style={{ minHeight: '240px' }}
                  value={currentProject.rawLyrics}
                  onChange={(e) =>
                    setCurrentProject((prev) => ({ ...prev, rawLyrics: e.target.value }))
                  }
                  placeholder="Dán lời bài hát (lyrics) vào đây để AI xử lý..."
                />
              </div>
              <button
                onClick={handleStartSync}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-amber-500 py-7 text-[13px] font-black uppercase tracking-[0.5em] text-black shadow-2xl shadow-amber-500/30 transition-all hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Kích hoạt AI Sync <ChevronRight className="h-6 w-6" />
              </button>
              {error && (
                <p className="animate-bounce text-center text-[11px] font-black uppercase tracking-widest text-red-400">
                  {error}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Step 2: Studio Editor ────────────────────────────────────────────────
  return (
    <div className="flex flex-col text-slate-100">
      {/* Processing overlay */}
      {isProcessing && (
        <div className="bg-[#080910]/98 animate-fadeIn fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-10">
            <BrainCircuit className="h-24 w-24 animate-pulse text-amber-500" />
            <Sparkles className="absolute -right-2 -top-2 h-8 w-8 animate-bounce text-amber-300" />
          </div>
          <h2 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-4xl font-black uppercase italic tracking-tighter text-transparent">
            {processingMessage}
          </h2>
        </div>
      )}

      {/* Studio toolbar */}
      <div className="glass-panel z-40 flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-8 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
            Studio <span className="text-amber-400">Professional</span>
          </div>
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
            />
            <div className="absolute left-6 top-6 z-40 flex scale-95 items-center gap-4 rounded-xl border border-white/10 bg-black/60 px-4 py-2 opacity-0 backdrop-blur-2xl transition-all group-hover:scale-100 group-hover:opacity-100">
              <div className="rec-dot h-3 w-3 rounded-full bg-red-600 shadow-[0_0_15px_red]"></div>
              <span className="font-mono text-[13px] font-black tracking-widest text-white">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
              </span>
            </div>
          </div>
        </main>

        {/* Right panel */}
        <aside className="glass-panel flex w-[440px] shrink-0 flex-col border-l border-white/[0.06] shadow-2xl">
          {/* Tabs */}
          <div className="flex h-20 items-center border-b border-white/[0.06] px-3">
            {[
              { id: 'typography', icon: Type, label: 'K.Chữ' },
              { id: 'appearance', icon: Palette, label: 'Giao Diện' },
              { id: 'vfx', icon: Ghost, label: 'VFX' },
              { id: 'lyrics', icon: Scissors, label: 'Lời' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`relative mx-1 flex h-14 flex-1 flex-col items-center justify-center gap-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'text-slate-500 hover:bg-white/[0.05]'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-amber-500"></div>
                )}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="custom-scrollbar flex-1 space-y-10 overflow-y-auto p-8 pb-8">
            {activeTab === 'typography' && (
              <div className="animate-fadeIn space-y-10">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Hiệu ứng chạy chữ
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'classic', label: 'Cổ điển' },
                      { id: 'basic-ktv', label: 'Basic Karaoke' },
                      { id: 'neon-pulse', label: 'Neon Soft' },
                      { id: 'float-up', label: 'Mềm mại' },
                      { id: 'glitch', label: 'Digital' },
                      { id: 'wave-distort', label: 'Gợn sóng' },
                      { id: 'fire-glow', label: 'Hỏa rực rỡ' },
                      { id: 'smoke-rise', label: 'Làn khói' },
                      { id: 'rainbow-sweep', label: 'Cầu vồng' },
                      { id: 'blur-reveal', label: 'Hiện mờ' },
                      { id: 'zoom-bounce', label: 'Phóng to' },
                    ].map((anim) => (
                      <button
                        key={anim.id}
                        onClick={() =>
                          handleStyleUpdate('textAnimation', anim.id as TextStyle['textAnimation'])
                        }
                        className={`flex items-center justify-center rounded-2xl border px-4 py-4 text-center text-[10px] font-black uppercase transition-all ${
                          currentProject.style.textAnimation === anim.id
                            ? 'border-amber-400 bg-amber-500 text-black shadow-xl shadow-amber-500/20'
                            : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
                        }`}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>
                </div>

                {currentProject.style.textAnimation === 'basic-ktv' && (
                  <div className="animate-fadeIn space-y-5">
                    <div className="flex items-center gap-3 border-l-4 border-amber-500/60 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Tùy chọn Basic KTV
                    </div>
                    <div className="glass-panel grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] p-5">
                      <button
                        onClick={() => handleStyleUpdate('ktvFillType', 'flat')}
                        className={`rounded-xl border py-3 text-[9px] font-black uppercase transition-all ${
                          currentProject.style.ktvFillType === 'flat'
                            ? 'border-amber-400 bg-amber-500 text-black'
                            : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
                        }`}
                      >
                        Màu đơn (Flat)
                      </button>
                      <button
                        onClick={() => handleStyleUpdate('ktvFillType', 'rainbow')}
                        className={`rounded-xl border py-3 text-[9px] font-black uppercase transition-all ${
                          currentProject.style.ktvFillType === 'rainbow'
                            ? 'border-white/10 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white'
                            : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
                        }`}
                      >
                        Cầu vồng
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Phông chữ & Bố cục
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {FONTS.map((f) => (
                      <button
                        key={f}
                        onClick={() => handleStyleUpdate('fontFamily', f)}
                        style={{ fontFamily: f }}
                        className={`rounded-2xl border py-4 text-xs transition-all ${
                          currentProject.style.fontFamily === f
                            ? 'border-amber-400 bg-amber-500 text-black shadow-xl'
                            : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-panel space-y-8 rounded-[2.5rem] border border-white/[0.08] p-8">
                  <div className="space-y-5">
                    <div className="mb-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Đường Viền (Stroke)
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-slate-500">
                          <span>ĐỘ DÀY</span>
                          <span>{currentProject.style.strokeWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={currentProject.style.strokeWidth}
                          onChange={(e) =>
                            handleStyleUpdate('strokeWidth', parseFloat(e.target.value))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-slate-500">
                          <span>MÀU VIỀN</span>
                        </div>
                        <input
                          type="color"
                          className="h-8 w-full cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-transparent"
                          value={currentProject.style.strokeColor}
                          onChange={(e) => handleStyleUpdate('strokeColor', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="mb-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Đổ Bóng (Shadow)
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-slate-500">
                          <span>ĐỘ NHÒE</span>
                          <span>{currentProject.style.shadowBlur}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={currentProject.style.shadowBlur}
                          onChange={(e) =>
                            handleStyleUpdate('shadowBlur', parseInt(e.target.value))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-slate-500">
                          <span>MÀU BÓNG</span>
                        </div>
                        <input
                          type="color"
                          className="h-8 w-full cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-transparent"
                          value={currentProject.style.shadowColor}
                          onChange={(e) => handleStyleUpdate('shadowColor', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-slate-500">
                          <span>LỆCH X</span>
                        </div>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={currentProject.style.shadowOffsetX}
                          onChange={(e) =>
                            handleStyleUpdate('shadowOffsetX', parseInt(e.target.value))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-slate-500">
                          <span>LỆCH Y</span>
                        </div>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={currentProject.style.shadowOffsetY}
                          onChange={(e) =>
                            handleStyleUpdate('shadowOffsetY', parseInt(e.target.value))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel space-y-8 rounded-[2.5rem] border border-white/[0.08] p-8">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[9px] font-black text-slate-400">
                      <span>VỊ TRÍ DỌC (Y-AXIS)</span>
                      <span className="text-amber-500">{currentProject.style.positionY}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={currentProject.style.positionY}
                      onChange={(e) => handleStyleUpdate('positionY', parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[9px] font-black text-slate-400">
                      <span>CỠ CHỮ (FONT SIZE)</span>
                      <span className="text-amber-500">{currentProject.style.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      value={currentProject.style.fontSize}
                      onChange={(e) => handleStyleUpdate('fontSize', parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="animate-fadeIn space-y-10">
                <div className="space-y-5">
                  <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <ImageIcon className="h-4 w-4" /> Logo & Nhận diện
                  </label>
                  <div className="glass-panel space-y-8 rounded-[2.5rem] border border-white/[0.08] p-8">
                    <div className="space-y-4">
                      <label className="px-1 text-[8px] font-black uppercase text-slate-500">
                        Intro Editor
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-xs text-white outline-none focus:border-amber-500"
                        placeholder="Tên bài hát..."
                        value={currentProject.style.introTitle}
                        onChange={(e) => handleStyleUpdate('introTitle', e.target.value)}
                      />
                      <input
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-xs text-white outline-none focus:border-amber-500"
                        placeholder="Ca sĩ..."
                        value={currentProject.style.introArtist}
                        onChange={(e) => handleStyleUpdate('introArtist', e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="px-1 text-[8px] font-black uppercase text-slate-500">
                        Tải Logo Mới
                      </label>
                      <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.03] p-4 transition-all hover:border-amber-500">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                          className="hidden"
                        />
                        <Upload className="h-4 w-4 text-slate-500 group-hover:text-amber-500" />
                        <span className="truncate text-[10px] font-black text-slate-400 group-hover:text-white">
                          {currentProject.logoFile ? currentProject.logoFile.name : 'Thay đổi Logo'}
                        </span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-[9px] font-black text-slate-400">
                        <span>KÍCH THƯỚC LOGO</span>
                        <span className="text-amber-500">{currentProject.style.logoSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="300"
                        value={currentProject.style.logoSize}
                        onChange={(e) => handleStyleUpdate('logoSize', parseInt(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(
                        (pos) => (
                          <button
                            key={pos}
                            onClick={() => handleStyleUpdate('logoPosition', pos)}
                            className={`rounded-xl border py-3 text-[9px] font-black uppercase transition-all ${
                              currentProject.style.logoPosition === pos
                                ? 'border-amber-400 bg-amber-500 text-black'
                                : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
                            }`}
                          >
                            {pos}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Music className="h-4 w-4" /> Hiệu ứng Nền
                  </label>
                  <div className="glass-panel space-y-6 rounded-[2.5rem] border border-white/[0.08] p-8">
                    <div className="space-y-4">
                      <div className="flex justify-between text-[9px] font-black text-slate-400">
                        <span>CƯỜNG ĐỘ NHỊP ĐIỆU (PULSE)</span>
                        <span className="text-amber-500">
                          {currentProject.style.bgPulseIntensity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentProject.style.bgPulseIntensity}
                        onChange={(e) =>
                          handleStyleUpdate('bgPulseIntensity', parseInt(e.target.value))
                        }
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Brush className="h-4 w-4" /> Bảng màu KTV
                  </label>
                  <div className="glass-panel grid grid-cols-2 gap-5 rounded-[2.5rem] border border-white/[0.08] p-8">
                    <div className="space-y-3">
                      <label className="block text-center text-[8px] font-black uppercase text-slate-500">
                        Chờ Hát
                      </label>
                      <div className="group relative">
                        <input
                          type="color"
                          className="absolute inset-0 z-10 h-16 w-full cursor-pointer bg-transparent opacity-0"
                          value={currentProject.style.initialColor}
                          onChange={(e) => handleStyleUpdate('initialColor', e.target.value)}
                        />
                        <div
                          className="h-16 w-full rounded-2xl border-2 border-white/10 shadow-inner transition-all group-hover:border-amber-500"
                          style={{ backgroundColor: currentProject.style.initialColor }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-center text-[8px] font-black uppercase text-slate-500">
                        Khi Hát
                      </label>
                      <div className="group relative">
                        <input
                          type="color"
                          className="absolute inset-0 z-10 h-16 w-full cursor-pointer bg-transparent opacity-0"
                          value={currentProject.style.activeColor}
                          onChange={(e) => handleStyleUpdate('activeColor', e.target.value)}
                        />
                        <div
                          className="h-16 w-full rounded-2xl border-2 border-white/10 shadow-inner transition-all group-hover:border-amber-500"
                          style={{ backgroundColor: currentProject.style.activeColor }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vfx' && (
              <div className="animate-fadeIn space-y-10">
                <div className="space-y-5">
                  <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Activity className="h-4 w-4" /> Biểu tượng Studio
                  </label>
                  <div className="mb-6 grid grid-cols-3 gap-3">
                    {[
                      { id: 'none', label: 'TẮT', icon: Ghost },
                      { id: 'equalizer', label: 'SÓNG EQ', icon: Activity },
                      { id: 'note', label: 'NỐT NHẠC', icon: Music },
                      { id: 'vinyl', label: 'ĐĨA THAN', icon: Disc },
                      { id: 'heart', label: 'TRÁI TIM', icon: Heart },
                      { id: 'star', label: 'NGÔI SAO', icon: Star },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          handleStyleUpdate('iconType', item.id as TextStyle['iconType'])
                        }
                        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border py-5 text-[9px] font-black uppercase transition-all ${
                          currentProject.style.iconType === item.id
                            ? 'border-amber-400 bg-amber-500 text-black shadow-2xl shadow-amber-500/30'
                            : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 ${currentProject.style.iconType === item.id ? 'animate-bounce' : ''}`}
                        />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {currentProject.style.iconType !== 'none' && (
                    <div className="glass-panel space-y-8 rounded-[2.5rem] border border-white/[0.08] p-8">
                      <div className="space-y-4">
                        <div className="flex justify-between text-[9px] font-black text-slate-400">
                          <span>KÍCH THƯỚC</span>
                          <span className="text-amber-500">{currentProject.style.iconSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={currentProject.style.iconSize}
                          onChange={(e) => handleStyleUpdate('iconSize', parseInt(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>VỊ TRÍ X</span>
                            <span className="text-amber-500">{currentProject.style.iconPosX}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentProject.style.iconPosX}
                            onChange={(e) =>
                              handleStyleUpdate('iconPosX', parseInt(e.target.value))
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between text-[9px] font-black text-slate-400">
                            <span>VỊ TRÍ Y</span>
                            <span className="text-amber-500">{currentProject.style.iconPosY}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentProject.style.iconPosY}
                            onChange={(e) =>
                              handleStyleUpdate('iconPosY', parseInt(e.target.value))
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[9px] font-black text-slate-400">
                          <span>ĐỘ TRONG SUỐT</span>
                          <span className="text-amber-500">
                            {Math.round(currentProject.style.iconOpacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={currentProject.style.iconOpacity}
                          onChange={(e) =>
                            handleStyleUpdate('iconOpacity', parseFloat(e.target.value))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Layout className="h-4 w-4" /> Sóng nhạc Spectrum
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'none', label: 'TẮT' },
                      { id: 'bars', label: 'CỘT SÓNG' },
                      { id: 'mirror', label: 'ĐỐI XỨNG' },
                      { id: 'circle', label: 'BAO QUANH' },
                      { id: 'radial', label: 'TỎA TRÒN' },
                    ].map((vis) => (
                      <button
                        key={vis.id}
                        onClick={() =>
                          handleStyleUpdate('visualizerType', vis.id as TextStyle['visualizerType'])
                        }
                        className={`rounded-2xl border py-5 text-[10px] font-black uppercase transition-all ${
                          currentProject.style.visualizerType === vis.id
                            ? 'border-amber-400 bg-amber-500 text-black shadow-xl'
                            : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.15]'
                        }`}
                      >
                        {vis.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Sparkles className="h-4 w-4" /> Hiệu ứng môi trường (VFX)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'none', label: 'VÔ HIỆU', icon: Ghost },
                      { id: 'stars', label: 'NGÔI SAO', icon: Star },
                      { id: 'snow', label: 'TUYẾT', icon: Droplets },
                      { id: 'bokeh', label: 'BOKEH', icon: Palette },
                      { id: 'rain', label: 'MƯA RƠI', icon: CloudRain },
                      { id: 'fireflies', label: 'ĐOM ĐÓM', icon: Sparkles },
                      { id: 'bubbles', label: 'BONG BÓNG', icon: Wind },
                      { id: 'dust', label: 'HẠT BỤI', icon: Activity },
                    ].map((vfx) => (
                      <button
                        key={vfx.id}
                        onClick={() => handleStyleUpdate('vfxType', vfx.id as TextStyle['vfxType'])}
                        className={`flex flex-col items-center gap-2 rounded-xl border py-4 text-[8px] font-black uppercase transition-all ${
                          currentProject.style.vfxType === vfx.id
                            ? 'border-amber-400 bg-amber-500 text-black'
                            : 'border-white/[0.08] bg-white/[0.03] text-slate-500'
                        }`}
                      >
                        {vfx.icon && <vfx.icon className="h-3.5 w-3.5" />}
                        {vfx.label}
                      </button>
                    ))}
                  </div>
                  {currentProject.style.vfxType !== 'none' && (
                    <div className="glass-panel mt-4 space-y-6 rounded-2xl border border-white/[0.08] p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between text-[9px] font-black text-slate-400">
                          <span>MẬT ĐỘ (INTENSITY)</span>
                          <span className="text-amber-500">
                            {currentProject.style.vfxIntensity}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="400"
                          value={currentProject.style.vfxIntensity}
                          onChange={(e) =>
                            handleStyleUpdate('vfxIntensity', parseInt(e.target.value))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[9px] font-black text-slate-400">
                          <span>TỐC ĐỘ (SPEED)</span>
                          <span className="text-amber-500">
                            {currentProject.style.vfxSpeed.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="5.0"
                          step="0.1"
                          value={currentProject.style.vfxSpeed}
                          onChange={(e) =>
                            handleStyleUpdate('vfxSpeed', parseFloat(e.target.value))
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[8px] font-black uppercase text-slate-500">
                          MÀU HIỆU ỨNG
                        </label>
                        <div className="flex gap-4">
                          <input
                            type="color"
                            className="h-10 w-12 cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-transparent"
                            value={currentProject.style.vfxColor}
                            onChange={(e) => handleStyleUpdate('vfxColor', e.target.value)}
                          />
                          <button
                            onClick={() =>
                              handleStyleUpdate('vfxColor', currentProject.style.activeColor)
                            }
                            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.05] text-[8px] font-black uppercase transition-all hover:border-amber-500"
                          >
                            Dùng Active Color
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'lyrics' && (
              <LyricEditor
                segments={currentProject.segments}
                currentTime={currentTime}
                onUpdate={(s: KaraokeSegment[]) =>
                  setCurrentProject((p) => ({ ...p, segments: s }))
                }
                onReSync={handleStartSync}
              />
            )}
          </div>

          {/* Export button */}
          <div className="glass-panel flex h-20 items-center border-t border-white/[0.06] px-8 backdrop-blur-2xl">
            <button className="w-full rounded-[2.5rem] bg-amber-500 py-4 text-[11px] font-black uppercase tracking-[0.4em] text-black shadow-2xl shadow-amber-500/30 transition-all hover:bg-amber-400 active:scale-95">
              XUẤT VIDEO (FINAL)
            </button>
          </div>
        </aside>
      </div>

      {/* Audio player — embedded at bottom */}
      <div className="glass-panel flex h-24 shrink-0 items-center gap-8 border-t border-white/[0.06] px-8">
        <button
          onClick={togglePlayback}
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
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}
            </span>
            <div className="flex items-center gap-3">
              <Music className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-600">
                Master Control Player
              </span>
            </div>
            <span className="font-mono text-[12px] font-black text-slate-500">
              {audioRef.current
                ? `${Math.floor(audioRef.current.duration / 60)}:${(audioRef.current.duration % 60).toFixed(1).padStart(4, '0')}`
                : '0.00'}
            </span>
          </div>
          <div className="group relative mx-2 h-2 rounded-full bg-white/[0.06] shadow-inner">
            <input
              type="range"
              min="0"
              max={audioRef.current?.duration || 100}
              step="0.001"
              value={currentTime}
              onChange={(e) => {
                if (audioRef.current) audioRef.current.currentTime = parseFloat(e.target.value);
              }}
              className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            />
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
              style={{
                width: `${(currentTime / (audioRef.current?.duration || 100)) * 100}%`,
              }}
            >
              <div className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 scale-0 rounded-full border-4 border-amber-500 bg-white shadow-[0_0_20px_white] transition-all group-hover:scale-100"></div>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentProject.audioUrl || ''}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default KaraokeStudioPage;
