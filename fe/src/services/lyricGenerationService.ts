import { generateContent } from './endpoints/gen-a-i';
import type { GenerationConfig, RewriteResponse } from '../types';

/**
 * Build system prompt for lyric rewriting based on configuration
 */
const buildSystemPrompt = (config: GenerationConfig): string => {
  const { theme, storyDescription, strictPhonetics } = config;

  return `
BẠN LÀ: Một bậc thầy thi sỹ và nhạc sỹ chuyên nghiệp tại Lyric Atelier Studio.
NHIỆM VỤ: Dệt lại ca từ cho bài hát dựa trên kịch bản: "${storyDescription}" và phong cách: "${theme}".

TRIẾT LÝ SÁNG TÁC (QUAN TRỌNG NHẤT):
1. Ý NGHĨA & NGHỆ THUẬT: Mỗi câu hát phải mang ý thơ, cảm xúc mạch lạc. Tuyệt đối KHÔNG viết những cụm từ rời rạc, vô nghĩa chỉ để khớp vần.
2. NGÔN TỪ: Sử dụng tiếng Việt chuẩn mực, giàu hình ảnh (metaphor).
3. ĐỐI VỚI NHẠC NGOẠI:
   - Cung cấp "transliteration" là phiên âm tiếng Việt CÓ DẤU (ví dụ: "Úa ai nì").
   - Lời mới phải mượt mà dựa trên phiên âm đó nhưng phải có nghĩa hay.
4. MUSIC STYLE PROMPT: Luôn cung cấp một prompt ngắn gọn bằng TIẾNG ANH mô tả phong cách nhạc này (ví dụ: "Emotional Ballad, acoustic piano, male vocals, melancholic").
5. THANH ĐIỆU (Strict = ${strictPhonetics}): Nếu bật, ưu tiên khớp nhóm thanh điệu nhưng luôn đặt Ý NGHĨA lên hàng đầu.

ĐỊNH DẠNG RESPONSE:
- Trả về JSON với structure:
{
  "songTitle": "string",
  "narrativeArc": "string",
  "musicalAppreciation": "string",
  "musicStylePrompt": "string (in English)",
  "isForeignLanguage": boolean,
  "sections": [
    {
      "title": "string",
      "lines": [
        {
          "original": "string",
          "transliteration": "string (optional, for foreign songs)",
          "rewritten": "string"
        }
      ]
    }
  ]
}
`;
};

/**
 * Build user prompt with original lyrics
 */
const buildUserPrompt = (originalText: string, config: GenerationConfig): string => {
  const { sourceLanguage } = config;

  return `
${buildSystemPrompt(config)}

Rewrite lyrics from source language: ${sourceLanguage === 'auto' ? 'auto-detect' : sourceLanguage}

Original lyrics:
${originalText}

Trả về JSON theo đúng format đã mô tả ở trên.
`;
};

/**
 * Parse API response to RewriteResponse
 */
const parseResponse = (generatedText: string): RewriteResponse => {
  try {
    // Remove markdown code blocks if present
    const cleaned = generatedText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
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
 * Generate rewritten lyrics using backend API
 */
export const rewriteLyricsWithAPI = async (
  originalText: string,
  config: GenerationConfig
): Promise<RewriteResponse & { creditsUsed: number; remainingCredits: number }> => {
  const prompt = buildUserPrompt(originalText, config);

  const response = await generateContent({
    prompt,
    model: config.useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
    maxTokens: 2048,
  });

  const data = response as any;
  const rewriteData = parseResponse(data.generatedText);

  return {
    ...rewriteData,
    creditsUsed: data.creditsUsed,
    remainingCredits: data.remainingCredits,
  };
};
