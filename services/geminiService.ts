import { GoogleGenAI, Type } from '@google/genai';
import { RewriteResponse } from '../types';

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json|```/g, '').trim();
};

export const generateRandomScenario = async (theme: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Hãy đóng vai một nhà biên kịch. Dựa trên phong cách "${theme}", hãy tạo một kịch bản ca khúc ngắn gọn (1-2 câu). Viết bằng ngôn ngữ tự sự, giàu hình ảnh.`,
  });
  return response.text?.trim() || 'Một câu chuyện chưa kể...';
};

export const extractLyricsFromMedia = async (
  base64Data: string,
  mimeType: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          {
            text: 'Chép lại lời bài hát từ file này một cách chính xác nhất. Chỉ trả về lời bài hát.',
          },
        ],
      },
    ],
  });
  return response.text || '';
};

export const detectThemeAndStory = async (lyrics: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Phân tích cảm xúc và chủ đề của lời bài hát: "${lyrics}". Trả về JSON theme, storyDescription.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING },
          storyDescription: { type: Type.STRING },
        },
        required: ['theme', 'storyDescription'],
      },
    },
  });
  return JSON.parse(cleanJsonResponse(response.text || '{}'));
};

export const rewriteLyrics = async (
  originalText: string,
  sourceLanguage: string,
  theme: string,
  storyDescription: string,
  useThinking: boolean,
  strictPhonetics: boolean
): Promise<RewriteResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-pro-preview';

  const systemInstruction = `
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

    JSON SCHEMA YÊU CẦU:
    - Trả về cấu trúc đầy đủ, không bỏ sót trường dữ liệu nào.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      songTitle: { type: Type.STRING },
      narrativeArc: { type: Type.STRING },
      musicalAppreciation: { type: Type.STRING },
      musicStylePrompt: {
        type: Type.STRING,
        description: 'Detailed style prompt in ENGLISH for AI Music generators like Suno/Udio',
      },
      isForeignLanguage: { type: Type.BOOLEAN },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  rewritten: { type: Type.STRING },
                },
              },
            },
          },
          required: ['title', 'lines'],
        },
      },
    },
    required: [
      'songTitle',
      'narrativeArc',
      'musicalAppreciation',
      'musicStylePrompt',
      'isForeignLanguage',
      'sections',
    ],
  };

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Rewrite lyrics from source language: ${sourceLanguage}. 
    Original:
    ${originalText}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
      systemInstruction,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  try {
    const text = cleanJsonResponse(response.text || '{}');
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    throw new Error('Lỗi định dạng dữ liệu từ AI. Vui lòng thử lại sau giây lát.');
  }
};
