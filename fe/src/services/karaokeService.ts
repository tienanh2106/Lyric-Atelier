import { KaraokeSegment } from '../types/karaoke';
import { syncKaraoke, transcribeAudio } from './endpoints/gen-a-i';
import type { GenerationDataDto } from './models';

export const transcribeAudioForKaraoke = async (file: File): Promise<string> => {
  const result = await transcribeAudio({ file, language: 'vi', mode: 'karaoke' });
  return (result as unknown as GenerationDataDto)?.generatedText ?? '';
};

export const syncKaraokeWithAPI = async (
  file: File,
  rawLyrics: string
): Promise<KaraokeSegment[]> => {
  // Gemini audio processing can take up to 2 minutes for long songs
  const result = await syncKaraoke({ file, rawLyrics }, { timeout: 180000 });
  const raw = (result as unknown as GenerationDataDto)?.generatedText ?? '[]';

  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned) as KaraokeSegment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error('Failed to parse karaoke segments JSON:', raw);
    return [];
  }
};
