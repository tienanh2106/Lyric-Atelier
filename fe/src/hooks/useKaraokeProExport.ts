import { useState } from 'react';
import { ProProjectData } from '../types/karaokeProTypes';

export function useKaraokeProExport(
  currentProject: ProProjectData,
  instrumentalUrl: string | null,
  setError: (e: string | null) => void
) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(3);
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d')!;

    const exportAudio = document.createElement('audio');
    exportAudio.src = instrumentalUrl || currentProject.audioUrl || '';
    exportAudio.preload = 'auto';

    let exportRafId = 0;
    let progressInterval = 0;

    try {
      await new Promise<void>((resolve, reject) => {
        exportAudio.oncanplaythrough = () => resolve();
        exportAudio.onerror = () => reject(new Error('Không tải được audio'));
        exportAudio.load();
      });
      const duration = exportAudio.duration || 1;
      setExportProgress(8);

      let bgImage: HTMLImageElement | null = null;
      if (currentProject.backgroundUrl && currentProject.backgroundType === 'image') {
        bgImage = await new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = currentProject.backgroundUrl!;
        });
      }

      const { renderProExportFrame } = await import('../utils/karaokeProExportRenderer');

      const stream = exportCanvas.captureStream(30);
      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const dest = audioCtx.createMediaStreamDestination();
      const audioSrc = audioCtx.createMediaElementSource(exportAudio);
      audioSrc.connect(dest);
      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) stream.addTrack(audioTrack);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const renderLoop = () => {
        renderProExportFrame(ctx, exportAudio.currentTime, currentProject, bgImage);
        exportRafId = requestAnimationFrame(renderLoop);
      };
      renderLoop();

      progressInterval = window.setInterval(() => {
        const pct = Math.round((exportAudio.currentTime / duration) * 85) + 10;
        setExportProgress(Math.min(pct, 95));
      }, 400);

      exportAudio.currentTime = 0;
      recorder.start(200);
      void exportAudio.play();
      setExportProgress(10);

      await new Promise<void>((resolve, reject) => {
        exportAudio.onended = () => resolve();
        exportAudio.onerror = () => reject(new Error('Lỗi trong lúc phát audio'));
      });

      clearInterval(progressInterval);
      cancelAnimationFrame(exportRafId);
      recorder.stop();

      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });
      setExportProgress(97);

      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), {
        href: url,
        download: 'karaoke-pro.webm',
      }).click();
      URL.revokeObjectURL(url);
      setExportProgress(100);
    } catch (err) {
      console.error('Export thất bại:', err);
      setError('Xuất video thất bại: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      clearInterval(progressInterval);
      cancelAnimationFrame(exportRafId);
      exportAudio.pause();
      exportAudio.src = '';
      setIsExporting(false);
    }
  };

  const handleExportMP4 = async () => {
    const audioSrc = instrumentalUrl || currentProject.audioUrl;
    if (!audioSrc) {
      setError('Không có nguồn audio');
      return;
    }
    if (!('VideoEncoder' in window)) {
      setError('Trình duyệt không hỗ trợ VideoEncoder. Vui lòng dùng Chrome 94+');
      return;
    }

    setIsExporting(true);
    setExportProgress(3);
    try {
      const W = 1920,
        H = 1080,
        FPS = 30;

      const arrayBuffer = await fetch(audioSrc).then((r) => r.arrayBuffer());
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      await audioCtx.close();
      const duration = audioBuffer.duration;
      const totalFrames = Math.ceil(duration * FPS);
      setExportProgress(8);

      let bgImage: HTMLImageElement | null = null;
      if (currentProject.backgroundUrl && currentProject.backgroundType === 'image') {
        bgImage = await new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = currentProject.backgroundUrl!;
        });
      }

      const { renderProExportFrame } = await import('../utils/karaokeProExportRenderer');
      const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');

      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: { codec: 'avc', width: W, height: H },
        audio: {
          codec: 'aac',
          sampleRate: audioBuffer.sampleRate,
          numberOfChannels: audioBuffer.numberOfChannels,
        },
        fastStart: 'in-memory',
      });

      // eslint-disable-next-line no-undef
      const videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta!),
        error: (e) => {
          throw e;
        },
      });
      videoEncoder.configure({
        codec: 'avc1.640028',
        width: W,
        height: H,
        bitrate: 8_000_000,
        framerate: FPS,
      });

      // eslint-disable-next-line no-undef
      const audioEncoder = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta!),
        error: (e) => {
          throw e;
        },
      });
      audioEncoder.configure({
        codec: 'mp4a.40.2',
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        bitrate: 192_000,
      });

      const { sampleRate, numberOfChannels, length: audioLen } = audioBuffer;
      const channelData = Array.from({ length: numberOfChannels }, (_, c) =>
        audioBuffer.getChannelData(c)
      );
      const CHUNK = 1024;
      for (let offset = 0; offset < audioLen; offset += CHUNK) {
        const frames = Math.min(CHUNK, audioLen - offset);
        const timestamp = Math.round((offset / sampleRate) * 1_000_000);
        const data = new Float32Array(numberOfChannels * frames);
        for (let c = 0; c < numberOfChannels; c++) {
          data.set(channelData[c].subarray(offset, offset + frames), c * frames);
        }
        // eslint-disable-next-line no-undef
        const ad = new AudioData({
          format: 'f32-planar',
          sampleRate,
          numberOfFrames: frames,
          numberOfChannels,
          timestamp,
          data,
        });
        audioEncoder.encode(ad);
        ad.close();
      }
      await audioEncoder.flush();
      setExportProgress(15);

      const offscreen = document.createElement('canvas');
      offscreen.width = W;
      offscreen.height = H;
      const offCtx = offscreen.getContext('2d')!;

      for (let i = 0; i < totalFrames; i++) {
        const timeS = i / FPS;
        renderProExportFrame(offCtx, timeS, currentProject, bgImage);
        // eslint-disable-next-line no-undef
        const vf = new VideoFrame(offscreen, { timestamp: Math.round(timeS * 1_000_000) });
        videoEncoder.encode(vf, { keyFrame: i % (FPS * 2) === 0 });
        vf.close();
        if (i % 30 === 0) {
          setExportProgress(15 + Math.round((i / totalFrames) * 78));
          await new Promise<void>((r) => setTimeout(r, 0));
        }
      }
      await videoEncoder.flush();
      setExportProgress(95);

      muxer.finalize();
      const mp4Url = URL.createObjectURL(new Blob([target.buffer], { type: 'video/mp4' }));
      Object.assign(document.createElement('a'), {
        href: mp4Url,
        download: 'karaoke-pro.mp4',
      }).click();
      URL.revokeObjectURL(mp4Url);
      setExportProgress(100);
    } catch (err) {
      console.error('Export MP4 thất bại:', err);
      setError('Xuất MP4 thất bại: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, exportProgress, handleExport, handleExportMP4 };
}
