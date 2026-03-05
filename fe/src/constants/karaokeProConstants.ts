import { ProTextStyle } from '../types/karaokeProTypes';

export const PRO_FONTS = [
  'Plus Jakarta Sans',
  'Cormorant Garamond',
  'Montserrat',
  'Lexend',
  'Lora',
  'Playfair Display',
  'Dancing Script',
];

export const PRO_VFX_LABELS: Record<string, string> = {
  none: 'Không có',
  stars: 'Ngôi Sao',
  snow: 'Tuyết Rơi',
  fireflies: 'Đom Đóm',
  bubbles: 'Bong Bóng',
  matrix: 'Matrix',
  nebula: 'Tinh Vân',
  aurora: 'Cực Quang',
  'glitch-lines': 'Glitch',
  'parallax-stars': 'Sao Parallax',
  'geometric-drift': 'Hình Học',
  'fluid-smoke': 'Khói',
};

export const PRO_ANIMATION_LABELS: Record<string, string> = {
  classic: 'Classic',
  smooth: 'Smooth',
  'neon-glow': 'Neon Glow',
  'fill-step': 'Fill Step',
  'rhythmic-pulse': 'Pulse',
  zoom: 'Zoom',
  bounce: 'Bounce',
  rainbow: 'Rainbow',
};

export const DEFAULT_PRO_STYLE: ProTextStyle = {
  fontFamily: 'Plus Jakarta Sans',
  fontSize: 24,
  letterSpacing: 2,
  lineGap: 80,
  sideMargin: 0,
  initialColor: '#94a3b8',
  activeColor: '#f59e0b',
  strokeColor: '#000000',
  strokeWidth: 0,
  shadowBlur: 20,
  shadowColor: '#000000',
  glowIntensity: 15,
  allCaps: false,
  positionY: 80,
  wordAnimation: 'classic',
  vfxType: 'stars',
  vfxDensity: 60,
  vfxSpeed: 1.0,
  visualizerType: 'prism-spectrum',
  bgBrightness: 100,
  bgContrast: 100,
  bgSaturation: 100,
  bgBlur: 0,
  bgOverlayOpacity: 30,
  globalOffset: 0,
};
