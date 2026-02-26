import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { CreditsService } from '../credits/credits.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { SuggestScenarioDto, ScenarioType } from './dto/suggest-scenario.dto';
import { MediaToTextDto, MediaType } from './dto/media-to-text.dto';
import { RewriteLyricsDto } from './dto/rewrite-lyrics.dto';
import { DetectThemeDto } from './dto/detect-theme.dto';
import { ScenarioFromThemeDto } from './dto/scenario-from-theme.dto';
import { ErrorCode } from '../../common/enums/error-code.enum';
import {
  CREDIT_CONFIG,
  calcDynamicCost,
  countWords,
  estimateAudioWords,
} from '../../config/credits.config';

export interface GenerationResult {
  message: string;
  data: {
    generatedText: string;
    creditsUsed: number;
    tokensUsed: number;
    remainingCredits: number;
  };
}

export interface CostEstimation {
  estimatedCost: number;
  operation: string;
}

interface CreditBalance {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  expiredCredits: number;
  creditsExpiringSoon: number;
}

@Injectable()
export class GenAIService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly groq: Groq | null = null;
  private readonly defaultModel: string;
  private readonly thinkingModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly creditsService: CreditsService,
  ) {
    const apiKey = this.configService.get<string>('genai.apiKey');
    if (!apiKey) {
      throw new Error('Google GenAI API key is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);

    const groqApiKey = this.configService.get<string>('groq.apiKey');
    if (groqApiKey) {
      this.groq = new Groq({ apiKey: groqApiKey });
    }

    this.defaultModel =
      this.configService.get<string>('genai.defaultModel') ??
      'gemini-2.5-flash';
    this.thinkingModel =
      this.configService.get<string>('genai.thinkingModel') ??
      'gemini-2.5-pro-preview-06-05';
  }

  async generateContent(
    userId: string,
    generateDto: GenerateContentDto,
  ): Promise<GenerationResult> {
    const { prompt, model = 'gemini-2.5-flash' } = generateDto;

    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'Prompt cannot be empty',
      });
    }

    const cost = CREDIT_CONFIG.generateContent.fixed;

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < cost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${cost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({ model });
      const result = await genModel.generateContent(prompt);
      const generatedText = result.response.text();

      await this.creditsService.deductCredits(
        userId,
        cost,
        'AI content generation',
        { prompt: prompt.substring(0, 200), model, creditsCharged: cost },
      );

      return {
        message: 'Content generated successfully',
        data: {
          generatedText,
          creditsUsed: cost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - cost,
        },
      };
    } catch (error) {
      // If generation failed, don't deduct credits
      if (error instanceof BadRequestException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to generate content: ${errorMessage}`,
      });
    }
  }

  estimateCost(_prompt: string, _maxTokens?: number): CostEstimation {
    return {
      estimatedCost: CREDIT_CONFIG.generateContent.fixed,
      operation: 'generateContent',
    };
  }

  async suggestScenario(
    userId: string,
    suggestDto: SuggestScenarioDto,
  ): Promise<GenerationResult> {
    const {
      prompt,
      scenarioType = ScenarioType.GENERAL,
      numberOfSuggestions = 3,
    } = suggestDto;

    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'Prompt cannot be empty',
      });
    }

    // Build system prompt based on scenario type
    let systemPrompt = '';
    switch (scenarioType) {
      case ScenarioType.MUSIC_LYRICS:
        systemPrompt = `You are an expert music composer and lyricist. Please suggest ${numberOfSuggestions} detailed scenarios/ideas for writing song lyrics based on the following request: "${prompt}".
Each suggestion should include:
- Main theme
- Mood/emotion
- Music style
- Structure ideas (verse, chorus, bridge)
- Some suggested imagery/metaphors`;
        break;
      case ScenarioType.STORY_WRITING:
        systemPrompt = `You are a professional writer. Please suggest ${numberOfSuggestions} detailed story scenarios based on the request: "${prompt}".
Each scenario should include:
- Main premise
- Main characters and their roles
- Conflict/problem
- Setting
- Story development direction`;
        break;
      case ScenarioType.MARKETING:
        systemPrompt = `You are a creative marketing expert. Please suggest ${numberOfSuggestions} marketing scenarios/strategies based on the request: "${prompt}".
Each scenario should include:
- Campaign idea
- Target audience
- Key message
- Communication channels
- Specific content suggestions`;
        break;
      case ScenarioType.CREATIVE_WRITING:
        systemPrompt = `You are a versatile content creator. Please suggest ${numberOfSuggestions} creative ideas based on the request: "${prompt}".
Each idea should be detailed and highly practical.`;
        break;
      default:
        systemPrompt = `Please suggest ${numberOfSuggestions} detailed and creative scenarios/ideas based on the following request: "${prompt}".
Each suggestion should be specific, easy to implement, and highly creative.`;
    }

    const fullPrompt = `${systemPrompt}\n\nPlease respond in Vietnamese, clearly formatted with suggestions numbered from 1 to ${numberOfSuggestions}.`;

    const cost = CREDIT_CONFIG.suggestScenario.fixed;

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < cost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${cost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });
      const result = await genModel.generateContent(fullPrompt);
      const generatedText = result.response.text();

      await this.creditsService.deductCredits(
        userId,
        cost,
        'AI scenario suggestion',
        {
          scenarioType,
          prompt: prompt.substring(0, 200),
          creditsCharged: cost,
        },
      );

      return {
        message: 'Scenarios suggested successfully',
        data: {
          generatedText,
          creditsUsed: cost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - cost,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to suggest scenarios: ${errorMessage}`,
      });
    }
  }

  async mediaToText(
    userId: string,
    mediaDto: MediaToTextDto,
  ): Promise<GenerationResult> {
    const {
      mediaUrl,
      mediaType,
      mimeType = mediaType === MediaType.AUDIO ? 'audio/mpeg' : 'video/mp4',
      prompt = 'Transcribe this media file to text',
      language = 'vi',
    } = mediaDto;

    if (!mediaUrl || mediaUrl.trim().length === 0) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'Media URL cannot be empty',
      });
    }

    const languageLabel = language === 'vi' ? 'Vietnamese' : language;
    const fullPrompt = `${prompt}

Please transcribe the ${mediaType} content accurately.
- If this is a song, format the output as song lyrics.
- If it's dialogue, use speaker labels where identifiable.
- Provide the transcription in ${languageLabel}.`;

    const cost = CREDIT_CONFIG.mediaToText.fixed;

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < cost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${cost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });

      const result = await genModel.generateContent([
        { fileData: { mimeType, fileUri: mediaUrl } },
        { text: fullPrompt },
      ]);

      const generatedText = result.response.text();

      await this.creditsService.deductCredits(
        userId,
        cost,
        'AI media to text conversion',
        {
          mediaType,
          mediaUrl: mediaUrl.substring(0, 100),
          language,
          creditsCharged: cost,
        },
      );

      return {
        message: 'Media transcribed successfully',
        data: {
          generatedText,
          creditsUsed: cost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - cost,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to transcribe media: ${errorMessage}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Lyric rewriting — prompt is built server-side from structured params
  // ---------------------------------------------------------------------------

  private static readonly STRICT_MODE_INSTRUCTION = `
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

  private static readonly CREATIVE_MODE_INSTRUCTION = `
CHẾ ĐỘ: SÁNG TÁC TỰ DO (CREATIVE FLOW)
- Lối sáng tác tự do như các nhạc sỹ chuyên viết lời cho nhạc nước ngoài.
- Ưu tiên cảm xúc, sự trôi chảy và ý nghĩa sâu sắc.
- Giữ nhịp điệu chung nhưng hoàn toàn linh hoạt về thanh dấu và số từ để đạt được ca từ đẹp nhất.
- Không bị gò bó bởi quy tắc khớp dấu 100%.`;

  private buildLyricsPrompt(dto: RewriteLyricsDto): string {
    const {
      originalText,
      sourceLanguage = 'auto',
      theme = '',
      storyDescription = '',
      gender = 'female',
      mode = 'strict',
    } = dto;

    const genderLabel = gender === 'male' ? 'Nam' : 'Nữ';
    const genderEnLabel = gender === 'male' ? 'male' : 'female';
    const modeInstruction =
      mode === 'strict'
        ? GenAIService.STRICT_MODE_INSTRUCTION
        : GenAIService.CREATIVE_MODE_INSTRUCTION;
    const modeLabel = mode === 'strict' ? 'ĐỒNG ĐIỆU' : 'SÁNG TÁC TỰ DO';
    const sourceLangLabel =
      sourceLanguage === 'auto' ? 'auto-detect' : sourceLanguage;

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
4. MUSIC STYLE PROMPT: Luôn cung cấp một prompt ngắn gọn bằng TIẾNG ANH mô tả phong cách nhạc này (ví dụ: "Emotional Ballad, acoustic piano, ${genderEnLabel} vocals, melancholic").

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

Dệt lời mới theo source language: ${sourceLangLabel}. Chế độ: ${modeLabel}. Giọng hát: ${genderLabel}.

Ca từ gốc:
${originalText}

Trả về JSON theo đúng format đã mô tả ở trên.
`;
  }

  async rewriteLyrics(
    userId: string,
    dto: RewriteLyricsDto,
  ): Promise<GenerationResult> {
    if (!dto.originalText || dto.originalText.trim().length === 0) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'Original lyrics cannot be empty',
      });
    }

    const model = dto.useThinking ? this.thinkingModel : this.defaultModel;
    const prompt = this.buildLyricsPrompt(dto);

    const wordCount = countWords(dto.originalText);
    const costCfg = dto.useThinking
      ? CREDIT_CONFIG.rewriteLyricsThinking
      : CREDIT_CONFIG.rewriteLyrics;
    const cost = calcDynamicCost(costCfg, wordCount);

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < cost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${cost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({ model });
      const result = await genModel.generateContent(prompt);
      const generatedText = result.response.text();

      await this.creditsService.deductCredits(
        userId,
        cost,
        'AI lyric rewriting',
        {
          theme: dto.theme,
          mode: dto.mode,
          gender: dto.gender,
          useThinking: dto.useThinking,
          wordCount,
          creditsCharged: cost,
        },
      );

      return {
        message: 'Lyrics rewritten successfully',
        data: {
          generatedText,
          creditsUsed: cost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - cost,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to rewrite lyrics: ${errorMessage}`,
      });
    }
  }

  async detectTheme(
    userId: string,
    dto: DetectThemeDto,
  ): Promise<GenerationResult> {
    const prompt = `Phân tích cảm xúc và chủ đề của lời bài hát: "${dto.lyrics}".

Trả về JSON với format:
{
  "theme": "string - tên chủ đề/phong cách",
  "storyDescription": "string - mô tả câu chuyện"
}`;

    const wordCount = countWords(dto.lyrics);
    const cost = calcDynamicCost(CREDIT_CONFIG.detectTheme, wordCount);

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < cost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${cost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });
      const result = await genModel.generateContent(prompt);
      const generatedText = result.response.text();

      await this.creditsService.deductCredits(
        userId,
        cost,
        'AI theme detection',
        { wordCount, creditsCharged: cost },
      );

      return {
        message: 'Theme detected successfully',
        data: {
          generatedText,
          creditsUsed: cost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - cost,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to detect theme: ${errorMessage}`,
      });
    }
  }

  async scenarioFromTheme(
    userId: string,
    dto: ScenarioFromThemeDto,
  ): Promise<GenerationResult> {
    const prompt = `Hãy đóng vai một nhà biên kịch. Dựa trên phong cách "${dto.theme}", hãy tạo một kịch bản ca khúc ngắn gọn (1-2 câu). Viết bằng ngôn ngữ tự sự, giàu hình ảnh.`;

    const cost = CREDIT_CONFIG.scenarioFromTheme.fixed;

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < cost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${cost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });
      const result = await genModel.generateContent(prompt);
      const generatedText = result.response.text();

      await this.creditsService.deductCredits(
        userId,
        cost,
        'AI scenario generation from theme',
        { theme: dto.theme, creditsCharged: cost },
      );

      return {
        message: 'Scenario generated successfully',
        data: {
          generatedText,
          creditsUsed: cost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - cost,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to generate scenario: ${errorMessage}`,
      });
    }
  }

  async syncKaraoke(
    userId: string,
    file: Express.Multer.File,
    rawLyrics: string,
  ): Promise<GenerationResult> {
    if (!file?.buffer) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'No audio file provided',
      });
    }

    if (!rawLyrics || rawLyrics.trim().length === 0) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'Raw lyrics cannot be empty',
      });
    }

    // Use actual lyric word count — reflects sync complexity directly
    const wordCount = countWords(rawLyrics);
    const cost = calcDynamicCost(CREDIT_CONFIG.syncKaraoke, wordCount);

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < cost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${cost}`,
      });
    }

    try {
      const lyricLines = rawLyrics
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const audioBase64 = file.buffer.toString('base64');

      // ── Strategy: Gemini (segment boundaries) + Whisper (word rhythm) ───────
      // Gemini knows the EXACT provided lyrics → accurate line-level start/end.
      // Whisper CTC gives word-onset timestamps from acoustic analysis — these
      // reflect the singer's actual pauses, elongations, and rhythm even when
      // Whisper's transcription text differs from the provided lyrics.
      // We map Whisper word positions PROPORTIONALLY to lyric words (no text
      // matching needed) so the singer's rhythm drives word highlight timing.
      const geminiPrompt = `Bạn là chuyên gia đồng bộ karaoke. Nghe kỹ TOÀN BỘ file audio từ đầu đến cuối.

Lời bài hát (đầy đủ tất cả các lần lặp, theo đúng thứ tự):
${lyricLines.map((l, i) => `${i + 1}. ${l}`).join('\n')}

NHIỆM VỤ: Xác định startTime và endTime (giây) của từng dòng trong audio.
Quy tắc:
- Output phải có ĐÚNG ${lyricLines.length} phần tử, mỗi phần tử ứng với 1 dòng theo thứ tự
- Timestamps tăng dần, không chồng lấp
- Bỏ qua nhạc dạo — chỉ timestamp phần ca sỹ hát

Trả về JSON array (không markdown, không giải thích):
[{"text":"<dòng lời>","startTime":<số thực>,"endTime":<số thực>},...]`;

      const arrayBuffer = file.buffer.buffer.slice(
        file.buffer.byteOffset,
        file.buffer.byteOffset + file.buffer.byteLength,
      ) as ArrayBuffer;
      const audioFile = new File([arrayBuffer], file.originalname, {
        type: file.mimetype,
      });

      const [geminiResult, whisperRaw] = await Promise.all([
        this.genAI
          .getGenerativeModel({ model: this.defaultModel })
          .generateContent([
            { inlineData: { mimeType: file.mimetype, data: audioBase64 } },
            { text: geminiPrompt },
          ]),
        this.groq
          ? this.groq.audio.transcriptions.create({
              file: audioFile,
              model: 'whisper-large-v3-turbo',
              language: 'vi',
              response_format: 'verbose_json',
              timestamp_granularities: ['word'],
            } as any)
          : Promise.resolve(null),
      ]);

      const rawJson = geminiResult.response
        .text()
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(rawJson) as Array<{
        text: string;
        startTime: number;
        endTime: number;
      }>;

      // Whisper word-onset timestamps (CTC acoustic alignment)
      type WhisperWord = { word: string; start: number; end: number };
      const whisperWords: WhisperWord[] =
        (whisperRaw as { words?: WhisperWord[] })?.words ?? [];

      const segments = (Array.isArray(parsed) ? parsed : []).map((seg, i) => {
        const lyricWords = seg.text.split(/\s+/).filter(Boolean);
        // Whisper words whose onset falls within this segment's window
        const segWhisperWords = whisperWords.filter(
          (w) => w.start >= seg.startTime - 0.3 && w.start < seg.endTime + 0.3,
        );
        return {
          id: `seg_${i + 1}`,
          text: seg.text,
          startTime: seg.startTime,
          endTime: seg.endTime,
          words: this.mapWordsByRhythm(
            lyricWords,
            segWhisperWords,
            seg.startTime,
            seg.endTime,
          ),
        };
      });

      const generatedText = JSON.stringify(segments);

      await this.creditsService.deductCredits(
        userId,
        cost,
        'Karaoke sync via Gemini segment timestamps',
        {
          fileName: file.originalname,
          fileSize: file.size,
          wordCount,
          creditsCharged: cost,
        },
      );

      return {
        message: 'Karaoke synced successfully',
        data: {
          generatedText,
          creditsUsed: cost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - cost,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      )
        throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to sync karaoke: ${errorMessage}`,
      });
    }
  }

  /**
   * Map lyric words onto Whisper word timestamps using positional (rhythm) mapping.
   *
   * No text matching — instead, word i out of n lyric words is mapped to
   * position (i/n * m) in the Whisper word list. This preserves the singer's
   * actual timing pattern (nhấn nhá) captured by Whisper CTC, even when
   * Whisper's text differs from the raw lyrics.
   */
  private mapWordsByRhythm(
    lyricWords: string[],
    whisperWords: Array<{ word: string; start: number; end: number }>,
    segStart: number,
    segEnd: number,
  ): Array<{ text: string; startTime: number; endTime: number }> {
    const n = lyricWords.length;
    if (!n) return [];

    if (!whisperWords.length) {
      // Fallback: proportional distribution by character count
      const totalChars = lyricWords.reduce((s, w) => s + w.length, 0) || 1;
      const duration = Math.max(0.1, segEnd - segStart);
      let cum = 0;
      return lyricWords.map((w) => {
        const t0 = segStart + (cum / totalChars) * duration;
        cum += w.length;
        return {
          text: w,
          startTime: t0,
          endTime: segStart + (cum / totalChars) * duration,
        };
      });
    }

    const m = whisperWords.length;
    // Build timeline: [w0.start, w0.end≈w1.start, ..., wm-1.end]
    const timeline = [
      ...whisperWords.map((w) => w.start),
      whisperWords[m - 1].end,
    ];

    return lyricWords.map((word, i) => {
      // Map lyric word i → fractional position in whisper word list
      const posStart = (i / n) * m;
      const posEnd = ((i + 1) / n) * m;

      const loS = Math.min(Math.floor(posStart), m - 1);
      const loE = Math.min(Math.floor(posEnd), m - 1);
      const stepS = timeline[loS + 1] - timeline[loS];
      const stepE = timeline[loE + 1] - timeline[loE];

      const startTime = timeline[loS] + (posStart - loS) * stepS;
      const endTime = timeline[loE] + (posEnd - loE) * stepE;

      return { text: word, startTime, endTime };
    });
  }

  async transcribeAudio(
    userId: string,
    file: Express.Multer.File,
    language = 'vi',
    mode: string = 'lyrics',
  ): Promise<GenerationResult> {
    if (!file?.buffer) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'No audio/video file provided',
      });
    }

    const estimatedWords = estimateAudioWords(file.size);
    const cost = calcDynamicCost(CREDIT_CONFIG.transcribeAudio, estimatedWords);

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < cost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${cost}`,
      });
    }

    try {
      // Use Gemini Flash with inline audio — significantly better than Whisper
      // for Vietnamese songs because it understands music + vocal context together
      const audioBase64 = file.buffer.toString('base64');

      const isVi = language === 'vi';
      const isKaraoke = mode === 'karaoke';

      const viAccuracyRules = `
CHÍNH XÁC DẤU THANH & VẦN (ƯU TIÊN CAO NHẤT):
- Phân biệt 6 thanh: ngang (a), huyền (à), sắc (á), hỏi (ả), ngã (ã), nặng (ạ)
- Phân biệt nguyên âm: ô/o/ơ — ư/u — ă/â/a — iê/ia — uô/ua — ươ/ưa
- Phân biệt phụ âm dễ nhầm: d/gi/r — ch/tr — s/x — n/nh — ng/ngh — c/k/q
- Dùng ngữ nghĩa và ngữ cảnh âm nhạc để chọn từ đúng khi âm không rõ
- KHÔNG đoán mò: nếu không nghe rõ, chọn từ có nghĩa phù hợp nhất với context bài`;

      const prompt = isVi
        ? isKaraoke
          ? `Bạn là chuyên gia phiên âm lời bài hát tiếng Việt cho karaoke.
Nghe kỹ file audio và phiên âm CHÍNH XÁC toàn bộ phần lời theo đúng thứ tự thời gian từ đầu đến cuối.
${viAccuracyRules}

QUY TẮC LỜI:
- Phiên âm TẤT CẢ các lần hát — kể cả lời lặp (điệp khúc 3 lần → viết đủ 3 lần)
- TUYỆT ĐỐI KHÔNG gộp, KHÔNG bỏ qua bất kỳ đoạn nào dù trùng với đoạn trước

QUY TẮC PHÂN DÒNG:
- Ngắt dòng theo hơi thở/nhịp hát tự nhiên của ca sỹ (4–8 từ/dòng)
- KHÔNG ngắt giữa chừng một cụm từ có nghĩa

FORMAT: chỉ lời hát thuần — không nhãn đoạn, không markdown, không số thứ tự`
          : `Bạn là chuyên gia phiên âm lời bài hát tiếng Việt.
Nghe file audio và phiên âm lời theo cấu trúc bài (mỗi đoạn CHỈ 1 LẦN, không lặp lại).
${viAccuracyRules}

QUY TẮC:
- Cấu trúc: verse 1, điệp khúc, verse 2, bridge... mỗi đoạn duy nhất 1 lần
- Điệp khúc lặp nhiều lần trong audio → chỉ viết 1 lần đại diện
- Ngắt dòng theo ý nhạc tự nhiên

FORMAT: chỉ lời hát thuần — không nhãn đoạn, không markdown, không số thứ tự`
        : isKaraoke
          ? `You are a professional song lyrics transcription expert for karaoke.
Listen carefully and transcribe ALL lyrics in chronological order from start to finish.

ACCURACY RULES:
- Transcribe the exact words sung — do not paraphrase or correct grammar
- Use context and musical phrase to disambiguate similar-sounding words
- Do NOT guess: if unclear, pick the most contextually fitting word

LYRIC RULES:
- Include EVERY repetition (chorus 3 times → write 3 times in full)
- Never merge or skip repeated sections

LINE BREAKS: follow the singer's natural breath/phrase boundaries (~5–8 words per line)

FORMAT: lyrics only — no section labels, no notes, no markdown, no numbering`
          : `You are a professional song lyrics transcription expert.
Transcribe the lyrics as a unique song structure (each section once only).

ACCURACY RULES:
- Transcribe the exact words sung — do not paraphrase
- Use context to disambiguate similar-sounding words

RULES:
- Song structure: verse 1, chorus, verse 2, bridge... each section ONCE only
- If the chorus repeats in the audio → write it only once

FORMAT: lyrics only — no section labels, no notes, no markdown, no numbering`;

      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });

      const result = await genModel.generateContent([
        { inlineData: { mimeType: file.mimetype, data: audioBase64 } },
        { text: prompt },
      ]);

      const generatedText = result.response.text().trim();

      await this.creditsService.deductCredits(
        userId,
        cost,
        'Audio transcription via Gemini Flash multimodal',
        {
          fileName: file.originalname,
          fileSize: file.size,
          estimatedWords,
          language,
          creditsCharged: cost,
        },
      );

      return {
        message: 'Audio transcribed successfully',
        data: {
          generatedText,
          creditsUsed: cost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - cost,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to transcribe audio: ${errorMessage}`,
      });
    }
  }
}
