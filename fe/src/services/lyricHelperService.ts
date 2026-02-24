import { suggestScenario, generateContent } from './endpoints/gen-a-i';
import { axiosInstance } from './custom-instance';
import type { GenerationDataDto } from './models';

/**
 * Generate random scenario based on theme using API
 */
export const generateRandomScenarioWithAPI = async (theme: string): Promise<string> => {
  try {
    const response = await suggestScenario({
      prompt: `Hãy đóng vai một nhà biên kịch. Dựa trên phong cách "${theme}", hãy tạo một kịch bản ca khúc ngắn gọn (1-2 câu). Viết bằng ngôn ngữ tự sự, giàu hình ảnh.`,
    });
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
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', 'vi');

  const response = await axiosInstance<{ generatedText: string }>({
    url: '/api/genai/transcribe',
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  });

  return (response as unknown as GenerationDataDto).generatedText || '';
};

/**
 * Detect theme and story from lyrics using API
 */
export const detectThemeAndStoryWithAPI = async (
  lyrics: string
): Promise<{ theme: string; storyDescription: string }> => {
  try {
    const response = await generateContent({
      prompt: `Phân tích cảm xúc và chủ đề của lời bài hát: "${lyrics}".

Trả về JSON với format:
{
  "theme": "string - tên chủ đề/phong cách",
  "storyDescription": "string - mô tả câu chuyện"
}`,
      model: 'gemini-2.5-flash',
      maxTokens: 512,
    });

    // Parse JSON response
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
