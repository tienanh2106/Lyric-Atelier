import { useRef, useState, useCallback } from 'react';

export interface NeonAudioRefs {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  analyser: AnalyserNode | null;
  destRef: React.RefObject<MediaStreamAudioDestinationNode | null>;
  hasInteracted: boolean;
  initAudio: () => Promise<void>;
}

export function useNeonAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.5;
    analyserNode.minDecibels = -90;
    analyserNode.maxDecibels = -10;

    analyserRef.current = analyserNode;
    setAnalyser(analyserNode);

    const dest = ctx.createMediaStreamDestination();
    destRef.current = dest;

    if (audioRef.current) {
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);
      source.connect(dest);
      sourceRef.current = source;
    }

    setHasInteracted(true);
  }, []);

  const resumeContext = useCallback(async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  return {
    audioRef,
    analyser,
    destRef,
    hasInteracted,
    initAudio,
    resumeContext,
  };
}
