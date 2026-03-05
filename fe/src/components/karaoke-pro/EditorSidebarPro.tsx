import React, { useState } from 'react';
import { Type, Zap, Sparkles, Image, Timer, Scissors, Download } from 'lucide-react';
import { ProProjectData, ProTextStyle, ProWord, ProStep } from '../../types/karaokeProTypes';
import { TypographyPanelPro } from './TypographyPanelPro';
import { AnimationPanelPro } from './AnimationPanelPro';
import { VFXPanelPro } from './VFXPanelPro';
import { BackgroundFiltersPanelPro } from './BackgroundFiltersPanelPro';
import { WordTimingEditorPro } from './WordTimingEditorPro';
import { VocalRemovalStepPro } from './VocalRemovalStepPro';
import { ExportStepPro } from './ExportStepPro';
import { DEFAULT_PRO_STYLE } from '../../constants/karaokeProConstants';

type EditorTab = 'typography' | 'animation' | 'vfx' | 'background' | 'timing';

interface Props {
  project: ProProjectData;
  step: ProStep;
  currentTime: number;
  onStyleUpdate: <K extends keyof ProTextStyle>(key: K, value: ProTextStyle[K]) => void;
  onWordEdit: (lineId: string, wordIdx: number, updates: Partial<ProWord>) => void;
  onGlobalOffset: (offset: number) => void;
  onSetStep: (s: ProStep) => void;
  // Vocal removal
  isVocalProcessing: boolean;
  instrumentalUrl: string | null;
  useInstrumental: boolean;
  vocalError: string | null;
  onProcessVocal: () => void;
  onToggleVocal: () => void;
  // Export
  isExporting: boolean;
  exportProgress: number;
  onExportWebm: () => void;
  onExportMp4: () => void;
}

const TABS: { id: EditorTab; icon: React.FC<{ className?: string }>; label: string }[] = [
  { id: 'typography', icon: Type, label: 'Chữ' },
  { id: 'animation', icon: Zap, label: 'Anim' },
  { id: 'vfx', icon: Sparkles, label: 'VFX' },
  { id: 'background', icon: Image, label: 'BG' },
  { id: 'timing', icon: Timer, label: 'Timing' },
];

export const EditorSidebarPro: React.FC<Props> = ({
  project, step, currentTime,
  onStyleUpdate, onWordEdit, onGlobalOffset, onSetStep,
  isVocalProcessing, instrumentalUrl, useInstrumental, vocalError, onProcessVocal, onToggleVocal,
  isExporting, exportProgress, onExportWebm, onExportMp4,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('typography');

  return (
    <aside className="flex h-full w-[380px] shrink-0 flex-col border-l border-white/[0.06] bg-[#080910]">
      {/* Step nav */}
      <div className="flex shrink-0 border-b border-white/[0.06]">
        {([2, 3, 4] as ProStep[]).map((s) => (
          <button
            key={s}
            onClick={() => onSetStep(s)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
              step === s
                ? 'border-b-2 border-violet-500 text-violet-400'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            {s === 2 ? 'Editor' : s === 3 ? (
              <span className="flex items-center justify-center gap-1">
                <Scissors className="h-3 w-3" /> Vocal
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <Download className="h-3 w-3" /> Export
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Step 3: Vocal Removal */}
      {step === 3 && (
        <div className="flex-1 overflow-y-auto">
          <VocalRemovalStepPro
            isProcessing={isVocalProcessing}
            instrumentalUrl={instrumentalUrl}
            useInstrumental={useInstrumental}
            error={vocalError}
            onProcess={onProcessVocal}
            onToggle={onToggleVocal}
          />
        </div>
      )}

      {/* Step 4: Export */}
      {step === 4 && (
        <div className="flex-1 overflow-y-auto">
          <ExportStepPro
            isExporting={isExporting}
            exportProgress={exportProgress}
            onExportWebm={onExportWebm}
            onExportMp4={onExportMp4}
          />
        </div>
      )}

      {/* Step 2: Editor tabs */}
      {step === 2 && (
        <>
          {/* Tab bar */}
          <div className="flex shrink-0 border-b border-white/[0.06]">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-3 transition-all ${
                  activeTab === id ? 'text-violet-400' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <Icon className={`h-4 w-4 ${activeTab === id ? 'text-violet-400' : ''}`} />
                <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'typography' && (
              <TypographyPanelPro style={project.style} onUpdate={onStyleUpdate} />
            )}
            {activeTab === 'animation' && (
              <AnimationPanelPro style={project.style} onUpdate={onStyleUpdate} />
            )}
            {activeTab === 'vfx' && (
              <VFXPanelPro style={project.style} onUpdate={onStyleUpdate} />
            )}
            {activeTab === 'background' && (
              <BackgroundFiltersPanelPro
                style={project.style}
                onUpdate={onStyleUpdate}
                onReset={() => {
                  onStyleUpdate('bgBrightness', DEFAULT_PRO_STYLE.bgBrightness);
                  onStyleUpdate('bgContrast', DEFAULT_PRO_STYLE.bgContrast);
                  onStyleUpdate('bgSaturation', DEFAULT_PRO_STYLE.bgSaturation);
                  onStyleUpdate('bgBlur', DEFAULT_PRO_STYLE.bgBlur);
                  onStyleUpdate('bgOverlayOpacity', DEFAULT_PRO_STYLE.bgOverlayOpacity);
                }}
              />
            )}
            {activeTab === 'timing' && (
              <WordTimingEditorPro
                lines={project.lines}
                style={project.style}
                currentTime={currentTime}
                onWordEdit={onWordEdit}
                onGlobalOffset={onGlobalOffset}
              />
            )}
          </div>
        </>
      )}
    </aside>
  );
};
