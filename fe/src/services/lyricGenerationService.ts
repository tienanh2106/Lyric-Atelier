import { generateContent } from './endpoints/gen-a-i';
import type { GenerationDataDto } from './models';
import type { GenerationConfig, RewriteResponse } from '../types';
import { AI_MODELS, AI_MAX_TOKENS } from '../constants';

/**
 * Build system prompt for lyric rewriting based on configuration
 */
const STRICT_MODE_INSTRUCTION = `
CHẾ ĐỘ: ĐỒNG ĐIỆU 100% (ELITE PLATINUM)

YÊU CẦU BẮT BUỘC:
1. KHỚP SỐ TỪ (SYLLABLE COUNT):
   - Số lượng âm tiết trong mỗi câu mới PHẢI BẰNG CHÍNH XÁC số âm tiết/chữ trong câu gốc.
   - Ví dụ: Câu gốc tiếng Trung có 8 chữ → Câu tiếng Việt PHẢI có đúng 8 từ.
2. KHỚP DẤU THANH (TONE MATCHING):
   - Dấu của câu mới phải y hệt 100% dấu của từ gốc khi phiên âm ra âm Hán Việt (hoặc tiếng Việt).
   - Quy tắc: Ngang→Ngang, Huyền→Huyền, Sắc→Sắc, Hỏi→Hỏi, Ngã→Ngã, Nặng→Nặng.
3. CHẤT LƯỢNG NGHỆ THUẬT (QUYẾT ĐỊNH SỰ THÀNH BẠI):
   - TUYỆT ĐỐI KHÔNG ghép từ bừa bãi, ngô nghê, lủng củng chỉ để khớp dấu. Lời phải nên thơ, sâu sắc.
   - Sử dụng vốn từ vựng phong phú (từ Hán Việt, từ láy, ẩn dụ, hoán dụ) để dệt nên những câu hát tuyệt đẹp.
   - Nếu khớp dấu 100% khiến câu vô nghĩa, ưu tiên thanh điệu tương đồng về âm vực (Sắc/Ngã, Huyền/Nặng, Ngang/Hỏi).`;

const CREATIVE_MODE_INSTRUCTION = `
CHẾ ĐỘ: SÁNG TÁC TỰ DO (CREATIVE FLOW)
- Lối sáng tác tự do như các nhạc sỹ chuyên viết lời cho nhạc nước ngoài.
- Ưu tiên cảm xúc, sự trôi chảy và ý nghĩa sâu sắc.
- Giữ nhịp điệu chung nhưng hoàn toàn linh hoạt về thanh dấu và số từ để đạt được ca từ đẹp nhất.
- Không bị gò bó bởi quy tắc khớp dấu 100%.`;

const buildSystemPrompt = (config: GenerationConfig): string => {
  const { theme, storyDescription, gender, mode } = config;
  const genderLabel = gender === 'male' ? 'Nam' : 'Nữ';
  const modeInstruction = mode === 'strict' ? STRICT_MODE_INSTRUCTION : CREATIVE_MODE_INSTRUCTION;

  return `
BẠN LÀ MỘT BẬC THẦY SOẠN NHẠC VÀ THI SĨ (ELITE COMPOSER & POET) tại Lyric Atelier Studio.
NHIỆM VỤ: Dệt lại ca từ cho bài hát dựa trên kịch bản: "${storyDescription}".
PHONG CÁCH ÂM NHẠC: ${theme}.
ĐỐI TƯỢNG HÁT: ${genderLabel}.

${modeInstruction}

NGUYÊN TẮC NGHỆ THUẬT CHUNG:
1. Ý NGHĨA & NGHỆ THUẬT: Mỗi câu hát phải mang ý thơ, cảm xúc mạch lạc. Tuyệt đối KHÔNG viết những cụm từ rời rạc, vô nghĩa.
2. NGÔN TỪ: Sử dụng tiếng Việt chuẩn mực, giàu hình ảnh (metaphor).
3. ĐỐI VỚI NHẠC NGOẠI:
   - Cung cấp "transliteration" là phiên âm tiếng Việt CÓ DẤU (ví dụ: "Úa ai nì").
   - Lời mới phải mượt mà dựa trên phiên âm đó nhưng phải có nghĩa hay.
4. MUSIC STYLE PROMPT: Luôn cung cấp một prompt ngắn gọn bằng TIẾNG ANH mô tả phong cách nhạc này (ví dụ: "Emotional Ballad, acoustic piano, ${genderLabel === 'Nam' ? 'male' : 'female'} vocals, melancholic").

ĐỊNH DẠNG RESPONSE — Trả về JSON với structure:
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
  const { sourceLanguage, mode, gender } = config;
  const modeLabel = mode === 'strict' ? 'ĐỒNG ĐIỆU' : 'SÁNG TÁC TỰ DO';
  const genderLabel = gender === 'male' ? 'Nam' : 'Nữ';

  return `
${buildSystemPrompt(config)}

Dệt lời mới theo source language: ${sourceLanguage === 'auto' ? 'auto-detect' : sourceLanguage}. Chế độ: ${modeLabel}. Giọng hát: ${genderLabel}.

Ca từ gốc:
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
    model: config.useThinking ? AI_MODELS.THINKING : AI_MODELS.DEFAULT,
    maxTokens: AI_MAX_TOKENS.LYRICS_GENERATION,
  });

  const data = response as unknown as GenerationDataDto;
  const rewriteData = parseResponse(data.generatedText);

  return {
    ...rewriteData,
    creditsUsed: data.creditsUsed,
    remainingCredits: data.remainingCredits,
  };
};
