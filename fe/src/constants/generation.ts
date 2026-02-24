import type { GenerationConfig } from '../types';

/**
 * Default values for the lyric generation config form.
 * Applied when user opens Studio for the first time.
 */
export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  sourceLanguage: 'vi',
  theme: '',
  storyDescription: '',
  useThinking: true,
  intensity: 100,
  strictPhonetics: true,
};

/**
 * Language used for audio transcription (ISO 639-1 code).
 * Sent to Groq Whisper API as the `language` parameter.
 */
export const TRANSCRIBE_DEFAULT_LANGUAGE = 'vi';
