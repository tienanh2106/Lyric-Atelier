export enum WaveVariant {
  HEARTBEAT = 'HEARTBEAT',
  ENERGY_ORB = 'ENERGY_ORB',
  LASER_SHOW = 'LASER_SHOW',
  SPEAKER_CONE = 'SPEAKER_CONE',
  NEON_TUNNEL = 'NEON_TUNNEL',
  BOUNCING_IMAGE = 'BOUNCING_IMAGE',
  DISCO_EQUALIZER = 'DISCO_EQUALIZER',
}

export enum TextAnimation {
  NONE = 'NONE',
  PULSE = 'PULSE',
  SHAKE = 'SHAKE',
  GLITCH = 'GLITCH',
}

export interface NeonConfig {
  audioUrl: string;
  backgroundImageUrl: string;
  isBackgroundVideo: boolean;

  songTitle: string;
  subtitle: string;
  artistName: string;

  themeColor: string;
  autoGradient: boolean;

  waveVariant: WaveVariant;
  visualizerSize: number;
  visualizerOpacity: number;
  // eslint-disable-next-line no-undef
  visualizerBlendMode: GlobalCompositeOperation;
  useCustomGradient: boolean;
  visualizerColor1: string;
  visualizerColor2: string;
  visualizerCenterX: number;
  visualizerCenterY: number;

  titleFont: string;
  titleColor: string;
  titleSize: number;
  titleGlow: number;
  titleSpacing: number;
  titlePositionY: number;
  textAnimation: TextAnimation;

  logoUrl: string | null;
  logoSize: number;
  logoGlow: number;
  logoPositionY: number;

  progressBarColor: string;
  progressBarPositionY: number;

  bgPulse: boolean;
  bgPulseStrength: number;
  bgBeatFlash: boolean;
  bgShake: boolean;
  bgHueShift: boolean;

  effectFireflies: boolean;
  effectFirefliesCount: number;
  effectShootingStars: boolean;
  effectShootingStarsFreq: number;
  effectRadialBurst: boolean;
  effectStarField: boolean;
  effectStarFieldSpeed: number;

  bgBrightness: number;
  bgAutoBrightness: boolean;
  bgAutoBrightnessMin: number;
  bgAutoBrightnessMax: number;
  bgContrast: number;
  bgSaturation: number;
  bgHueRotate: number;
  bgBlur: number;
  bgVignette: number;

  bgTintColor: string;
  bgTintIntensity: number;
  // eslint-disable-next-line no-undef
  bgTintBlendMode: GlobalCompositeOperation;
}
