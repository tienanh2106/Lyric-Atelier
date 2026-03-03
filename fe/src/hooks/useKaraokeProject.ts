import { useState, useCallback, type ChangeEvent } from 'react';
import { ProjectData, TextStyle } from '../types/karaoke';
import { DEFAULT_STYLE } from '../constants/karaoke';
import {
  transcribeAudioForKaraoke,
  syncKaraokeWithAPI,
  extractInstrumentalFromAPI,
} from '../services/karaokeService';

interface UseKaraokeProjectOptions {
  onSyncSuccess?: () => void;
}

export function useKaraokeProject({ onSyncSuccess }: UseKaraokeProjectOptions = {}) {
  const [currentProject, setCurrentProject] = useState<ProjectData>({
    backgroundFile: null,
    backgroundUrl: null,
    backgroundType: null,
    audioFile: null,
    audioUrl: null,
    instrumentalUrl: null,
    logoFile: null,
    rawLyrics: '',
    segments: [],
    style: { ...DEFAULT_STYLE },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Đang chuẩn bị...');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, type: 'bg' | 'audio' | 'logo') => {
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
      const audioFile = currentProject.audioFile;
      const [syncedSegments, instrumentalUrl] = await Promise.all([
        syncKaraokeWithAPI(audioFile, currentProject.rawLyrics),
        extractInstrumentalFromAPI(audioFile).catch((err: unknown) => {
          console.warn('Không thể tách nhạc không lời:', err);
          return null;
        }),
      ]);
      if (syncedSegments && syncedSegments.length > 0) {
        setCurrentProject((prev) => ({ ...prev, segments: syncedSegments, instrumentalUrl }));
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
  };

  const handleStyleUpdate = useCallback((key: keyof TextStyle, value: unknown) => {
    setCurrentProject((prev) => ({ ...prev, style: { ...prev.style, [key]: value } }));
  }, []);

  return {
    currentProject,
    setCurrentProject,
    handleFileUpload,
    handleStartSync,
    handleStyleUpdate,
    isProcessing,
    processingMessage,
    error,
    setError,
  };
}
