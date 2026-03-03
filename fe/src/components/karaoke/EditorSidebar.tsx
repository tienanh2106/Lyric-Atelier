import React, { useState } from 'react';
import { Type, Palette, Ghost, Scissors } from 'lucide-react';
import { ProjectData, KaraokeSegment, TextStyle } from '../../types/karaoke';
import { TypographyPanel } from './TypographyPanel';
import { AppearancePanel } from './AppearancePanel';
import { VFXPanel } from './VFXPanel';
import { LyricEditor } from './LyricEditor';
import { ExportControls } from './ExportControls';

type TabId = 'typography' | 'appearance' | 'vfx' | 'lyrics';

interface EditorSidebarProps {
  currentProject: ProjectData;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'audio' | 'logo') => void;
  onStyleUpdate: (key: keyof TextStyle, value: unknown) => void;
  onSegmentsUpdate: (segments: KaraokeSegment[]) => void;
  currentTime: number;
  onReSync: () => void;
  isExporting: boolean;
  exportProgress: number;
  onExportWebm: () => void;
  onExportMp4: () => void;
}

const TABS: { id: TabId; icon: React.ElementType; label: string }[] = [
  { id: 'typography', icon: Type, label: 'K.Chữ' },
  { id: 'appearance', icon: Palette, label: 'Giao Diện' },
  { id: 'vfx', icon: Ghost, label: 'VFX' },
  { id: 'lyrics', icon: Scissors, label: 'Lời' },
];

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  currentProject,
  onFileUpload,
  onStyleUpdate,
  onSegmentsUpdate,
  currentTime,
  onReSync,
  isExporting,
  exportProgress,
  onExportWebm,
  onExportMp4,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('typography');

  return (
    <aside className="glass-panel flex w-[440px] shrink-0 flex-col border-l border-white/[0.06] shadow-2xl">
      {/* Tabs */}
      <div className="flex h-20 items-center border-b border-white/[0.06] px-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
          <TypographyPanel style={currentProject.style} onUpdate={onStyleUpdate} />
        )}
        {activeTab === 'appearance' && (
          <AppearancePanel
            style={currentProject.style}
            logoFile={currentProject.logoFile}
            onFileUpload={onFileUpload}
            onUpdate={onStyleUpdate}
          />
        )}
        {activeTab === 'vfx' && <VFXPanel style={currentProject.style} onUpdate={onStyleUpdate} />}
        {activeTab === 'lyrics' && (
          <LyricEditor
            segments={currentProject.segments}
            currentTime={currentTime}
            onUpdate={onSegmentsUpdate}
            onReSync={onReSync}
          />
        )}
      </div>

      {/* Export buttons */}
      <ExportControls
        isExporting={isExporting}
        exportProgress={exportProgress}
        onExportWebm={onExportWebm}
        onExportMp4={onExportMp4}
      />
    </aside>
  );
};
