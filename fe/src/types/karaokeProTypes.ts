export type ProVFXType =
  | 'none'
  | 'stars'
  | 'snow'
  | 'fireflies'
  | 'bubbles'
  | 'matrix'
  | 'nebula'
  | 'aurora'
  | 'glitch-lines'
  | 'parallax-stars'
  | 'geometric-drift'
  | 'fluid-smoke';

export type ProAnimationType =
  | 'classic'
  | 'smooth'
  | 'neon-glow'
  | 'fill-step'
  | 'rhythmic-pulse'
  | 'zoom'
  | 'bounce'
  | 'rainbow';

export interface ProTextStyle {
  fontFamily: string;
  fontSize: number;
  letterSpacing: number;
  lineGap: number;
  sideMargin: number;
  initialColor: string;
  activeColor: string;
  strokeColor: string;
  strokeWidth: number;
  shadowBlur: number;
  shadowColor: string;
  glowIntensity: number;
  allCaps: boolean;
  positionY: number;
  wordAnimation: ProAnimationType;
  vfxType: ProVFXType;
  vfxDensity: number;
  vfxSpeed: number;
  visualizerType: 'none' | 'ethereal-flow' | 'prism-spectrum';
  bgBrightness: number;
  bgContrast: number;
  bgSaturation: number;
  bgBlur: number;
  bgOverlayOpacity: number;
  globalOffset: number;
}

export interface ProWord {
  text: string;
  startTime: number;
  endTime: number;
}

export interface ProLine {
  id: string;
  words: ProWord[];
}

export interface ProProjectData {
  audioFile: File | null;
  audioUrl: string | null;
  backgroundFile: File | null;
  backgroundUrl: string | null;
  backgroundType: 'image' | 'video' | null;
  rawLyrics: string;
  lines: ProLine[];
  style: ProTextStyle;
}

export type ProStep = 1 | 2 | 3 | 4;
