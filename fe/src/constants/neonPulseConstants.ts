import { NeonConfig, WaveVariant, TextAnimation } from '../types/neonPulseTypes';

export const NEON_FONTS = [
  'Inter',
  'Montserrat',
  'Orbitron',
  'Rajdhani',
  'Exo 2',
  'Share Tech Mono',
];

export const WAVE_VARIANT_LABELS: Record<WaveVariant, string> = {
  [WaveVariant.HEARTBEAT]: 'Heartbeat',
  [WaveVariant.ENERGY_ORB]: 'Energy Orb',
  [WaveVariant.LASER_SHOW]: 'Laser Show',
  [WaveVariant.SPEAKER_CONE]: 'Speaker Cone',
  [WaveVariant.NEON_TUNNEL]: 'Neon Tunnel',
  [WaveVariant.BOUNCING_IMAGE]: 'Bouncing Image',
  [WaveVariant.DISCO_EQUALIZER]: 'Disco Equalizer',
};

export const TEXT_ANIMATION_LABELS: Record<TextAnimation, string> = {
  [TextAnimation.NONE]: 'None',
  [TextAnimation.PULSE]: 'Pulse',
  [TextAnimation.SHAKE]: 'Shake',
  [TextAnimation.GLITCH]: 'Glitch',
};

export const THEME_COLORS = [
  { value: 'cyan', label: 'Cyan' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'sunset', label: 'Sunset' },
];

export const BLEND_MODES: GlobalCompositeOperation[] = [
  'screen',
  'lighter',
  'overlay',
  'multiply',
  'color-dodge',
  'hard-light',
];

export const DEFAULT_NEON_CONFIG: NeonConfig = {
  audioUrl: '',
  backgroundImageUrl: '',
  isBackgroundVideo: false,

  songTitle: 'NEON HORIZON',
  subtitle: 'OFFICIAL AUDIO',
  artistName: '',

  themeColor: 'cyan',
  autoGradient: false,

  waveVariant: WaveVariant.HEARTBEAT,
  visualizerSize: 1.0,
  visualizerOpacity: 0.9,
  visualizerBlendMode: 'screen',
  useCustomGradient: false,
  visualizerColor1: '#ff0000',
  visualizerColor2: '#ff0099',
  visualizerCenterX: 50,
  visualizerCenterY: 50,

  titleFont: 'Inter',
  titleColor: '#ffffff',
  titleSize: 1,
  titleGlow: 25,
  titleSpacing: 5,
  titlePositionY: 45,
  textAnimation: TextAnimation.PULSE,

  logoUrl: null,
  logoSize: 1,
  logoGlow: 0,
  logoPositionY: 80,

  progressBarColor: '#0077ff',
  progressBarPositionY: 50,

  bgPulse: true,
  bgPulseStrength: 0.3,
  bgBeatFlash: false,
  bgShake: false,
  bgHueShift: false,

  effectFireflies: true,
  effectFirefliesCount: 40,
  effectShootingStars: false,
  effectShootingStarsFreq: 30,
  effectRadialBurst: true,
  effectStarField: true,
  effectStarFieldSpeed: 1,

  bgBrightness: 100,
  bgAutoBrightness: false,
  bgAutoBrightnessMin: 50,
  bgAutoBrightnessMax: 150,
  bgContrast: 100,
  bgSaturation: 100,
  bgHueRotate: 0,
  bgBlur: 0,
  bgVignette: 80,

  bgTintColor: '#000000',
  bgTintIntensity: 0.2,
  bgTintBlendMode: 'overlay',
};
