import { transcribeAudio, detectTheme, scenarioFromTheme } from './endpoints/gen-a-i';
import type { GenerationDataDto } from './models';
import { TRANSCRIBE_DEFAULT_LANGUAGE } from '../constants';

/**
 * Generate random scenario based on theme using API.
 * BE builds the prompt internally from the theme parameter.
 */
export const generateRandomScenarioWithAPI = async (theme: string): Promise<string> => {
  try {
    const response = await scenarioFromTheme({ theme });
    return (
      (response as unknown as GenerationDataDto).generatedText?.trim() ||
      'Một câu chuyện chưa kể...'
    );
  } catch (error) {
    console.error('Failed to generate scenario:', error);
    return 'Một câu chuyện chưa kể...';
  }
};

/**
 * Transcribe audio/video file directly using Groq Whisper (1 API call)
 */
export const uploadAndExtractLyrics = async (file: File): Promise<string> => {
  const response = await transcribeAudio({
    file,
    language: TRANSCRIBE_DEFAULT_LANGUAGE,
  });

  return (response as unknown as GenerationDataDto).generatedText || '';
};

/**
 * Detect theme and story from lyrics using API.
 * BE builds the analysis prompt internally from the lyrics.
 */
export const detectThemeAndStoryWithAPI = async (
  lyrics: string,
): Promise<{ theme: string; storyDescription: string }> => {
  try {
    const response = await detectTheme({ lyrics });

    const cleaned = (response as unknown as GenerationDataDto).generatedText
      .replace(/```json|```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      theme: parsed.theme || '',
      storyDescription: parsed.storyDescription || '',
    };
  } catch (error) {
    console.error('Failed to detect theme:', error);
    return {
      theme: '',
      storyDescription: '',
    };
  }
};
