import axios from 'axios';
import { KaraokeSegment } from '../types/karaoke';
import { syncKaraoke, transcribeAudio } from './endpoints/gen-a-i';
import type { GenerationDataDto } from './models';
import { getAccessToken } from '../utils/storage';

export const extractInstrumentalFromAPI = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const token = getAccessToken();
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) ?? '';
  const response = await axios.post<ArrayBuffer>(
    `${baseUrl}/api/genai/extract-instrumental`,
    formData,
    {
      responseType: 'arraybuffer',
      timeout: 120000,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  const blob = new Blob([response.data], { type: 'audio/mpeg' });
  return URL.createObjectURL(blob);
};

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
