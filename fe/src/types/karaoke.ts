export interface KaraokeWord {
  text: string;
  startTime: number;
  endTime: number;
}

export interface KaraokeSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  words?: KaraokeWord[];
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  letterSpacing: number;
  initialColor: string;
  activeColor: string;
  strokeColor: string;
  strokeWidth: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  positionX: number;
  positionY: number;
  allCaps: boolean;
  introTitle: string;
  introArtist: string;
  textAnimation:
    | 'classic'
    | 'basic-ktv'
    | 'neon-pulse'
    | 'float-up'
    | 'glitch'
    | 'blur-reveal'
    | 'zoom-bounce'
    | 'wave-distort'
    | 'fire-glow'
    | 'smoke-rise'
    | 'rainbow-sweep';
  ktvFillType: 'flat' | 'rainbow';
  vfxType: 'none' | 'snow' | 'stars' | 'bubbles' | 'dust' | 'rain' | 'fireflies' | 'bokeh';
  vfxIntensity: number;
  vfxSpeed: number;
  vfxColor: string;
  bgPulseIntensity: number;
  visualizerType: 'none' | 'bars' | 'wave' | 'circle' | 'radial' | 'mirror' | 'spectrum';
  iconType: 'none' | 'equalizer' | 'note' | 'vinyl' | 'heart' | 'star';
  iconSize: number;
  iconPosX: number;
  iconPosY: number;
  iconOpacity: number;
  logoUrl: string | null;
  logoSize: number;
  logoOpacity: number;
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export type AppStep = 1 | 2 | 3;

export interface ProjectData {
  backgroundFile: File | null;
  backgroundUrl: string | null;
  backgroundType: 'image' | 'video' | null;
  audioFile: File | null;
  audioUrl: string | null;
  logoFile: File | null;
  rawLyrics: string;
  segments: KaraokeSegment[];
  style: TextStyle;
}
