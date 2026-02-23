import { suggestScenario, mediaToText, generateContent } from './endpoints/gen-a-i';
import { uploadMedia } from './endpoints/upload';
import { MediaToTextDtoMediaType, UploadDataDto } from './models';

/**
 * Generate random scenario based on theme using API
 */
export const generateRandomScenarioWithAPI = async (theme: string): Promise<string> => {
  try {
    const response = await suggestScenario({
      prompt: `Hãy đóng vai một nhà biên kịch. Dựa trên phong cách "${theme}", hãy tạo một kịch bản ca khúc ngắn gọn (1-2 câu). Viết bằng ngôn ngữ tự sự, giàu hình ảnh.`,
    });
    return (response as any).generatedText?.trim() || 'Một câu chuyện chưa kể...';
  } catch (error) {
    console.error('Failed to generate scenario:', error);
    return 'Một câu chuyện chưa kể...';
  }
};

/**
 * Detect media type from MIME type
 */
const detectMediaType = (mimeType: string): MediaToTextDtoMediaType => {
  if (mimeType.startsWith('audio/')) {
    return MediaToTextDtoMediaType.audio;
  }
  if (mimeType.startsWith('video/')) {
    return MediaToTextDtoMediaType.video;
  }
  // Default to audio if unsure
  return MediaToTextDtoMediaType.audio;
};

/**
 * Upload media file and return the uploaded URI
 */
export const uploadMediaFile = async (file: File): Promise<string> => {
  try {
    const response = await uploadMedia({ file });

    return (response as any).uri;
  } catch (error) {
    console.error('Failed to upload media:', error);
    throw new Error('Không thể tải file lên. Vui lòng thử lại.');
  }
};

/**
 * Extract lyrics from media file (audio/video) using API
 * Accepts a file URL (from uploadMedia)
 */
export const extractLyricsFromMediaWithAPI = async (
  mediaUrl: string,
  mediaType: MediaToTextDtoMediaType
): Promise<string> => {
  try {
    const response = await mediaToText({
      mediaType,
      mediaUrl,
      prompt: 'Chép lại lời bài hát từ file này một cách chính xác nhất. Chỉ trả về lời bài hát.',
    });
    return (response as any).generatedText || '';
  } catch (error) {
    console.error('Failed to extract lyrics:', error);
    throw new Error('Không thể trích xuất lời bài hát. Vui lòng thử lại.');
  }
};

/**
 * Upload media file and extract lyrics (convenience function)
 */
export const uploadAndExtractLyrics = async (file: File): Promise<string> => {
  // Step 1: Upload file
  const mediaUrl = await uploadMediaFile(file);

  // Step 2: Detect media type
  const mediaType = detectMediaType(file.type);

  // Step 3: Extract lyrics
  const lyrics = await extractLyricsFromMediaWithAPI(mediaUrl, mediaType);

  return lyrics;
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
      model: 'gemini-3-flash-preview',
      maxTokens: 512,
    });

    // Parse JSON response
    const cleaned = (response as any).generatedText.replace(/```json|```/g, '').trim();
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
