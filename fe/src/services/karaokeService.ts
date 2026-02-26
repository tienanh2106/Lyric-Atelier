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
  const result = await syncKaraoke({ file, rawLyrics });
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
