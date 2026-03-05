import { useState, useRef, useEffect, useCallback } from 'react';
import { NeonConfig } from '../types/neonPulseTypes';
import { DEFAULT_NEON_CONFIG, NEON_FONTS } from '../constants/neonPulseConstants';
import { useNeonAudio } from '../hooks/useNeonAudio';
import NeonVisualizer from '../components/neon-pulse/NeonVisualizer';
import { NeonConfigPanel } from '../components/neon-pulse/NeonConfigPanel';
import { NeonPlayerControls } from '../components/neon-pulse/NeonPlayerControls';

export const NeonPulsePage = () => {
  const [config, setConfig] = useState<NeonConfig>(DEFAULT_NEON_CONFIG);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExportingMP4, setIsExportingMP4] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const { audioRef, analyser, destRef, hasInteracted, initAudio, resumeContext } = useNeonAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mp4RecorderRef = useRef<MediaRecorder | null>(null);
  const mp4ChunksRef = useRef<Blob[]>([]);

  // Inject Google Fonts for neon typography
  useEffect(() => {
    const fonts = NEON_FONTS.filter((f) => f !== 'Inter')
      .join('|')
      .replace(/ /g, '+');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    if (!hasInteracted) {
      await initAudio();
      await resumeContext();
    } else {
      await resumeContext();
    }
    if (!config.audioUrl) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleAudioFileChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setConfig((prev) => ({
      ...prev,
      audioUrl: url,
      songTitle: file.name.replace(/\.[^/.]+$/, ''),
    }));
    setIsPlaying(false);
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    setIsRecording(false);
  }, []);

  // Start recording after state is set
  useEffect(() => {
    if (!isRecording) return;
    let timeout: ReturnType<typeof setTimeout>;

    const startRecording = async () => {
      if (!canvasRef.current || !destRef.current || !audioRef.current) return;
      await resumeContext();
      await audioRef.current.play();
      setIsPlaying(true);
      chunksRef.current = [];

      timeout = setTimeout(() => {
        if (!canvasRef.current || !destRef.current) return;
        const canvasStream = canvasRef.current.captureStream(30);
        const audioStream = destRef.current.stream;
        const combined = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);

        try {
          const recorder = new MediaRecorder(combined, {
            mimeType: 'video/webm',
            videoBitsPerSecond: 8_000_000,
          });
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `neon_pulse_${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);
          };
          recorder.start();
          mediaRecorderRef.current = recorder;
        } catch (err) {
          console.error('Recording failed', err);
          setIsRecording(false);
        }
      }, 100);
    };

    startRecording();
    return () => clearTimeout(timeout);
  }, [isRecording]);

  const handleToggleRecord = async () => {
    if (!hasInteracted) await initAudio();
    if (isRecording) stopRecording();
    else setIsRecording(true);
  };

  const handleExportWebP = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/webp', 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon_pulse_${Date.now()}.webp`;
    a.click();
  };

  const handleStopMP4Export = () => {
    mp4RecorderRef.current?.stop();
  };

  const handleExportMP4 = async () => {
    if (!canvasRef.current || !destRef.current || !audioRef.current) return;
    if (!hasInteracted) await initAudio();
    await resumeContext();

    setIsExportingMP4(true);
    setExportProgress(0);
    mp4ChunksRef.current = [];

    const canvasStream = canvasRef.current.captureStream(30);
    const audioStream = destRef.current.stream;
    const combined = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    const recorder = new MediaRecorder(combined, {
      mimeType: 'video/webm',
      videoBitsPerSecond: 8_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) mp4ChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      setExportProgress(10);
      setIsPlaying(false);
      try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { fetchFile } = await import('@ffmpeg/util');
        const ff = new FFmpeg();
        ff.on('progress', ({ progress }: { progress: number }) =>
          setExportProgress(Math.round(progress * 85 + 10))
        );
        await ff.load();
        setExportProgress(12);

        const webmBlob = new Blob(mp4ChunksRef.current, { type: 'video/webm' });
        await ff.writeFile('input.webm', await fetchFile(webmBlob));
        await ff.exec([
          '-i',
          'input.webm',
          '-c:v',
          'libx264',
          '-preset',
          'fast',
          '-crf',
          '23',
          '-c:a',
          'aac',
          'output.mp4',
        ]);
        const mp4Data = await ff.readFile('output.mp4');

        const url = URL.createObjectURL(new Blob([mp4Data as Uint8Array], { type: 'video/mp4' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `neon_pulse_${Date.now()}.mp4`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
        setExportProgress(100);
      } catch (err) {
        console.error('MP4 export failed', err);
      } finally {
        setIsExportingMP4(false);
        setExportProgress(0);
      }
    };

    audioRef.current.currentTime = 0;
    await audioRef.current.play();
    setIsPlaying(true);
    recorder.start();
    mp4RecorderRef.current = recorder;
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div className="flex h-screen w-full select-none overflow-hidden bg-black font-sans">
      {/* Left: Visualizer + Controls */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <NeonVisualizer
            ref={canvasRef}
            analyser={analyser}
            isPlaying={isPlaying}
            config={config}
            audioRef={audioRef}
            isRecording={isRecording}
          />
        </div>

        {/* Player Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <NeonPlayerControls
            isPlaying={isPlaying}
            onTogglePlay={handlePlayPause}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            onFullscreen={handleFullscreen}
            isRecording={isRecording}
            onToggleRecord={handleToggleRecord}
          />
        </div>
      </div>

      {/* Right: Config Panel */}
      <NeonConfigPanel
        config={config}
        onUpdate={setConfig}
        onAudioFileChange={handleAudioFileChange}
        isRecording={isRecording}
        onToggleRecord={handleToggleRecord}
        onExportWebP={handleExportWebP}
        onExportMP4={handleExportMP4}
        isExportingMP4={isExportingMP4}
        exportProgress={exportProgress}
        onStopMP4Export={handleStopMP4Export}
      />

      {/* Hidden Audio */}
      <audio
        ref={audioRef}
        src={config.audioUrl || undefined}
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => {
          if (isRecording) stopRecording();
          if (mp4RecorderRef.current?.state === 'recording') mp4RecorderRef.current.stop();
          setIsPlaying(false);
        }}
        loop={!isRecording}
      />
    </div>
  );
};
