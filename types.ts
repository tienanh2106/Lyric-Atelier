
export interface LyricLine {
  original: string;
  transliteration?: string;
  rewritten: string;
}

export interface LyricSection {
  title: string;
  type: string;
  lines: LyricLine[];
}

export interface RewriteResponse {
  songTitle: string;
  narrativeArc: string;
  musicalAppreciation: string;
  musicStylePrompt: string;
  isForeignLanguage: boolean;
  sections: LyricSection[];
}

export interface GenerationConfig {
  sourceLanguage: 'auto' | 'vi' | 'zh' | 'ko' | 'en' | 'ja';
  theme: string;
  storyDescription: string;
  useThinking: boolean;
  intensity: number;
  strictPhonetics: boolean;
}
