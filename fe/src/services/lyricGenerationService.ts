import { rewriteLyrics } from './endpoints/gen-a-i';
import type { GenerationDataDto } from './models';
import type { GenerationConfig, RewriteResponse } from '../types';

/**
 * Parse the raw JSON string returned by the AI into a RewriteResponse.
 */
const parseResponse = (generatedText: string): RewriteResponse => {
  try {
    const cleaned = generatedText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (
      !parsed.songTitle ||
      !parsed.narrativeArc ||
      !parsed.musicalAppreciation ||
      !Array.isArray(parsed.sections)
    ) {
      throw new Error('Invalid response structure');
    }

    return parsed as RewriteResponse;
  } catch (error) {
    console.error('Failed to parse API response:', error);
    throw new Error('Lỗi định dạng dữ liệu từ AI. Vui lòng thử lại sau giây lát.');
  }
};

/**
 * Generate rewritten lyrics — sends structured config to BE, which builds the prompt.
 */
export const rewriteLyricsWithAPI = async (
  originalText: string,
  config: GenerationConfig
): Promise<RewriteResponse & { creditsUsed: number; remainingCredits: number }> => {
  const response = await rewriteLyrics({
    originalText,
    sourceLanguage: config.sourceLanguage,
    theme: config.theme,
    storyDescription: config.storyDescription,
    gender: config.gender,
    mode: config.mode,
    useThinking: config.useThinking,
  });

  const data = response as unknown as GenerationDataDto;
  const rewriteData = parseResponse(data.generatedText);

  return {
    ...rewriteData,
    creditsUsed: data.creditsUsed,
    remainingCredits: data.remainingCredits,
  };
};
