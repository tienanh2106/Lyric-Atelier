import { useState, useCallback } from 'react';

function audioBufferToWavUrl(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const byteLength = 44 + numSamples * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(byteLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, byteLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * numChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export function useVocalRemoval(audioFile: File | null) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [instrumentalUrl, setInstrumentalUrl] = useState<string | null>(null);
  const [useInstrumental, setUseInstrumental] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const process = useCallback(async () => {
    if (!audioFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioCtx = new OfflineAudioContext(2, 1, 44100);
      // We need to know the actual length first, decode first pass
      const tempCtx = new AudioContext();
      const decoded = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
      await tempCtx.close();

      const offlineCtx = new OfflineAudioContext(
        2,
        decoded.length,
        decoded.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;

      // Phase cancellation: stereo center removal
      // L' = (L - R) / 2, R' = (R - L) / 2
      const splitter = offlineCtx.createChannelSplitter(2);
      const merger = offlineCtx.createChannelMerger(2);

      // Invert one channel for subtraction
      const gainL = offlineCtx.createGain();
      const gainR = offlineCtx.createGain();
      const gainLneg = offlineCtx.createGain();
      const gainRneg = offlineCtx.createGain();
      gainL.gain.value = 0.5;
      gainR.gain.value = -0.5;
      gainLneg.gain.value = -0.5;
      gainRneg.gain.value = 0.5;

      source.connect(splitter);

      // Left output = L * 0.5 + R * (-0.5)
      splitter.connect(gainL, 0);
      splitter.connect(gainR, 1);
      gainL.connect(merger, 0, 0);
      gainR.connect(merger, 0, 0);

      // Right output = L * (-0.5) + R * 0.5
      splitter.connect(gainLneg, 0);
      splitter.connect(gainRneg, 1);
      gainLneg.connect(merger, 0, 1);
      gainRneg.connect(merger, 0, 1);

      merger.connect(offlineCtx.destination);
      source.start();

      const rendered = await offlineCtx.startRendering();
      const url = audioBufferToWavUrl(rendered);
      setInstrumentalUrl(url);
      setUseInstrumental(true);
    } catch (err) {
      console.error('Vocal removal failed:', err);
      setError('Không thể tách vocal. File có thể là mono hoặc đã được xử lý trước.');
    } finally {
      setIsProcessing(false);
    }
  }, [audioFile]);

  const toggle = useCallback(() => {
    setUseInstrumental((prev) => !prev);
  }, []);

  return { isProcessing, instrumentalUrl, useInstrumental, process, toggle, error };
}
