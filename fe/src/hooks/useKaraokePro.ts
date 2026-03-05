import { useState, useCallback } from 'react';
import { ProProjectData, ProLine, ProWord, ProTextStyle } from '../types/karaokeProTypes';
import { DEFAULT_PRO_STYLE } from '../constants/karaokeProConstants';
import { KaraokeSegment } from '../types/karaoke';
import { transcribeAudioForKaraoke, syncKaraokeWithAPI } from '../services/karaokeService';

function segmentToProLine(seg: KaraokeSegment): ProLine {
  if (seg.words && seg.words.length > 0) {
    return {
      id: seg.id,
      words: seg.words.map((w) => ({
        text: w.text,
        startTime: w.startTime,
        endTime: w.endTime,
      })),
    };
  }
  // Distribute timing evenly across words
  const wordTexts = seg.text.split(/\s+/).filter(Boolean);
  if (wordTexts.length === 0) {
    return {
      id: seg.id,
      words: [{ text: seg.text, startTime: seg.startTime, endTime: seg.endTime }],
    };
  }
  const duration = seg.endTime - seg.startTime;
  const wordDuration = duration / wordTexts.length;
  return {
    id: seg.id,
    words: wordTexts.map(
      (text, i): ProWord => ({
        text,
        startTime: seg.startTime + i * wordDuration,
        endTime: seg.startTime + (i + 1) * wordDuration,
      })
    ),
  };
}

interface UseKaraokeProOptions {
  onSyncSuccess?: () => void;
}

export function useKaraokePro({ onSyncSuccess }: UseKaraokeProOptions = {}) {
  const [project, setProject] = useState<ProProjectData>({
    audioFile: null,
    audioUrl: null,
    backgroundFile: null,
    backgroundUrl: null,
    backgroundType: null,
    rawLyrics: '',
    lines: [],
    style: { ...DEFAULT_PRO_STYLE },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Đang chuẩn bị...');
  const [error, setError] = useState<string | null>(null);

  const handleAudioUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setProject((p) => ({ ...p, audioFile: file, audioUrl: url }));
    setIsProcessing(true);
    setProcessingMessage('AI đang trích xuất lời nhạc...');
    setError(null);
    transcribeAudioForKaraoke(file)
      .then((text) => setProject((p) => ({ ...p, rawLyrics: text })))
      .catch((err: unknown) => {
        console.error(err);
        setError('Không thể trích xuất lời. Vui lòng dán lời thủ công.');
      })
      .finally(() => setIsProcessing(false));
  }, []);

  const handleBgUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setProject((p) => ({
      ...p,
      backgroundFile: file,
      backgroundUrl: url,
      backgroundType: file.type.startsWith('video') ? 'video' : 'image',
    }));
  }, []);

  const handleStartSync = useCallback(async () => {
    if (!project.audioFile || !project.rawLyrics) {
      setError('Vui lòng cung cấp đầy đủ nhạc và lời bài hát.');
      return;
    }
    setIsProcessing(true);
    setProcessingMessage('AI đang đồng bộ nhịp phách...');
    setError(null);
    try {
      const segments = await syncKaraokeWithAPI(project.audioFile, project.rawLyrics);
      if (segments && segments.length > 0) {
        const lines = segments.map(segmentToProLine);
        setProject((p) => ({ ...p, lines }));
        onSyncSuccess?.();
      } else {
        throw new Error('Không thể đồng bộ lời nhạc.');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi đồng bộ nhịp phách. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  }, [project.audioFile, project.rawLyrics, onSyncSuccess]);

  const handleStyleUpdate = useCallback(
    <K extends keyof ProTextStyle>(key: K, value: ProTextStyle[K]) => {
      setProject((p) => ({ ...p, style: { ...p.style, [key]: value } }));
    },
    []
  );

  const handleWordEdit = useCallback(
    (lineId: string, wordIdx: number, updates: Partial<ProWord>) => {
      setProject((p) => ({
        ...p,
        lines: p.lines.map((line) =>
          line.id === lineId
            ? {
                ...line,
                words: line.words.map((w, i) => (i === wordIdx ? { ...w, ...updates } : w)),
              }
            : line
        ),
      }));
    },
    []
  );

  const handleGlobalOffset = useCallback(
    (newOffset: number) => {
      const delta = newOffset - project.style.globalOffset;
      setProject((p) => ({
        ...p,
        style: { ...p.style, globalOffset: newOffset },
        lines: p.lines.map((line) => ({
          ...line,
          words: line.words.map((w) => ({
            ...w,
            startTime: Math.max(0, w.startTime + delta),
            endTime: Math.max(0, w.endTime + delta),
          })),
        })),
      }));
    },
    [project.style.globalOffset]
  );

  const handleLyricsChange = useCallback((text: string) => {
    setProject((p) => ({ ...p, rawLyrics: text }));
  }, []);

  return {
    project,
    setProject,
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
  };
}
