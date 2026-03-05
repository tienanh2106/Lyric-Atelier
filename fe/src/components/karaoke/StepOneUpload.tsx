import React from 'react';
import { Music, FileText, ChevronRight, Image as ImageIcon, Upload, Settings } from 'lucide-react';
import { Textarea } from '@/components/ui/Input';
import { ProjectData, TextStyle } from '../../types/karaoke';

interface StepOneUploadProps {
  currentProject: ProjectData;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'audio' | 'logo') => void;
  onStyleUpdate: (key: keyof TextStyle, value: unknown) => void;
  onLyricsChange: (text: string) => void;
  onStartSync: () => void;
  isProcessing: boolean;
  error: string | null;
}

export const StepOneUpload: React.FC<StepOneUploadProps> = ({
  currentProject,
  onFileUpload,
  onStyleUpdate,
  onLyricsChange,
  onStartSync,
  isProcessing,
  error,
}) => {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden text-slate-100">
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
                      onChange={(e) => onStyleUpdate('introTitle', e.target.value)}
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
                      onChange={(e) => onStyleUpdate('introArtist', e.target.value)}
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
                      onChange={(e) => onFileUpload(e, 'audio')}
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
                      onChange={(e) => onFileUpload(e, 'bg')}
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
                      onChange={(e) => onFileUpload(e, 'logo')}
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
                onChange={(e) => onLyricsChange(e.target.value)}
                placeholder="Dán lời bài hát (lyrics) vào đây để AI xử lý..."
              />
            </div>
            <button
              onClick={onStartSync}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-amber-500 py-7 text-[13px] font-black uppercase tracking-[0.5em] text-black shadow-2xl shadow-amber-500/30 transition-all hover:bg-amber-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Kích hoạt AI Sync <ChevronRight className="h-6 w-6" />
            </button>
            <p className="text-center text-[11px] text-slate-600">
              Transcribe ~5–25 credits · Sync ~16–40 credits · Tách nhạc 3 credits
              <br />
              <span className="text-slate-700">Tổng ~24–68 credits · tính theo độ dài bài hát</span>
            </p>
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
};
