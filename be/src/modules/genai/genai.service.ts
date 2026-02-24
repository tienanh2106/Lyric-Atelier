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
  estimatedTokens: number;
  estimatedCost: number;
  costPerToken: number;
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
  private readonly creditCostPerToken: number;
  private readonly transcribeCostFixed: number;
  private readonly charsPerToken: number;
  private readonly scenarioBufferTokens: number;
  private readonly mediaEstimatedTokens: number;

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
    this.creditCostPerToken =
      this.configService.get<number>('credits.costPerToken') ?? 0.01;
    this.transcribeCostFixed =
      this.configService.get<number>('credits.transcribeCostFixed') ?? 10;
    this.charsPerToken =
      this.configService.get<number>('credits.charsPerToken') ?? 4;
    this.scenarioBufferTokens =
      this.configService.get<number>('credits.scenarioBufferTokens') ?? 1000;
    this.mediaEstimatedTokens =
      this.configService.get<number>('credits.mediaEstimatedTokens') ?? 2000;
  }

  async generateContent(
    userId: string,
    generateDto: GenerateContentDto,
  ): Promise<GenerationResult> {
    const { prompt, maxTokens = 500, model = 'gemini-2.5-flash' } = generateDto;

    if (!prompt || prompt.trim().length === 0) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'Prompt cannot be empty',
      });
    }

    // Estimate credit cost (rough estimation based on prompt length)
    const estimatedTokens =
      Math.ceil(prompt.length / this.charsPerToken) + maxTokens;
    const estimatedCost = Math.ceil(estimatedTokens * this.creditCostPerToken);

    // Check if user has enough credits
    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < estimatedCost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Estimated cost: ${estimatedCost}`,
      });
    }

    let generatedText = '';
    let actualCost = 0;

    try {
      // Call Google GenAI
      const genModel = this.genAI.getGenerativeModel({ model });
      const result = await genModel.generateContent(prompt);
      const response = result.response;
      generatedText = response.text();

      // Calculate actual cost based on response
      const actualTokens = Math.ceil(
        (prompt.length + generatedText.length) / this.charsPerToken,
      );
      actualCost = Math.ceil(actualTokens * this.creditCostPerToken);

      // Deduct credits
      await this.creditsService.deductCredits(
        userId,
        actualCost,
        'AI content generation',
        {
          prompt: prompt.substring(0, 200),
          model,
          tokensUsed: actualTokens,
          creditsCharged: actualCost,
        },
      );

      return {
        message: 'Content generated successfully',
        data: {
          generatedText,
          creditsUsed: actualCost,
          tokensUsed: actualTokens,
          remainingCredits: balance.availableCredits - actualCost,
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

  estimateCost(prompt: string, maxTokens = 500): CostEstimation {
    const estimatedTokens =
      Math.ceil(prompt.length / this.charsPerToken) + maxTokens;
    const estimatedCost = Math.ceil(estimatedTokens * this.creditCostPerToken);

    return {
      estimatedTokens,
      estimatedCost,
      costPerToken: this.creditCostPerToken,
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

    // Estimate credit cost (add buffer for longer scenario responses)
    const estimatedTokens =
      Math.ceil(fullPrompt.length / this.charsPerToken) +
      this.scenarioBufferTokens;
    const estimatedCost = Math.ceil(estimatedTokens * this.creditCostPerToken);

    // Check if user has enough credits
    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < estimatedCost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Estimated cost: ${estimatedCost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });
      const result = await genModel.generateContent(fullPrompt);
      const response = result.response;
      const generatedText = response.text();

      // Calculate actual cost
      const actualTokens = Math.ceil(
        (fullPrompt.length + generatedText.length) / this.charsPerToken,
      );
      const actualCost = Math.ceil(actualTokens * this.creditCostPerToken);

      // Deduct credits
      await this.creditsService.deductCredits(
        userId,
        actualCost,
        'AI scenario suggestion',
        {
          scenarioType,
          prompt: prompt.substring(0, 200),
          tokensUsed: actualTokens,
          creditsCharged: actualCost,
        },
      );

      return {
        message: 'Scenarios suggested successfully',
        data: {
          generatedText,
          creditsUsed: actualCost,
          tokensUsed: actualTokens,
          remainingCredits: balance.availableCredits - actualCost,
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

    // Media processing uses more tokens than plain text
    const estimatedTokens = this.mediaEstimatedTokens;
    const estimatedCost = Math.ceil(estimatedTokens * this.creditCostPerToken);

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < estimatedCost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Estimated cost: ${estimatedCost}`,
      });
    }

    try {
      // Use gemini-2.5-flash which supports multimodal input (audio/video)
      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });

      // Pass the file directly via fileData instead of a plain URL string
      const result = await genModel.generateContent([
        {
          fileData: {
            mimeType,
            fileUri: mediaUrl,
          },
        },
        { text: fullPrompt },
      ]);

      const generatedText = result.response.text();

      const actualTokens = Math.ceil(
        (fullPrompt.length + generatedText.length) / this.charsPerToken,
      );
      const actualCost = Math.ceil(actualTokens * this.creditCostPerToken);

      await this.creditsService.deductCredits(
        userId,
        actualCost,
        'AI media to text conversion',
        {
          mediaType,
          mediaUrl: mediaUrl.substring(0, 100),
          language,
          tokensUsed: actualTokens,
          creditsCharged: actualCost,
        },
      );

      return {
        message: 'Media transcribed successfully',
        data: {
          generatedText,
          creditsUsed: actualCost,
          tokensUsed: actualTokens,
          remainingCredits: balance.availableCredits - actualCost,
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

  private static readonly LYRICS_MAX_TOKENS = 2048;

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
    const maxTokens = GenAIService.LYRICS_MAX_TOKENS;
    const prompt = this.buildLyricsPrompt(dto);

    const estimatedTokens =
      Math.ceil(prompt.length / this.charsPerToken) + maxTokens;
    const estimatedCost = Math.ceil(estimatedTokens * this.creditCostPerToken);

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < estimatedCost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Estimated cost: ${estimatedCost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({ model });
      const result = await genModel.generateContent(prompt);
      const generatedText = result.response.text();

      const actualTokens = Math.ceil(
        (prompt.length + generatedText.length) / this.charsPerToken,
      );
      const actualCost = Math.ceil(actualTokens * this.creditCostPerToken);

      await this.creditsService.deductCredits(
        userId,
        actualCost,
        'AI lyric rewriting',
        {
          theme: dto.theme,
          mode: dto.mode,
          gender: dto.gender,
          useThinking: dto.useThinking,
          tokensUsed: actualTokens,
          creditsCharged: actualCost,
        },
      );

      return {
        message: 'Lyrics rewritten successfully',
        data: {
          generatedText,
          creditsUsed: actualCost,
          tokensUsed: actualTokens,
          remainingCredits: balance.availableCredits - actualCost,
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

    const maxTokens = 512;
    const estimatedTokens =
      Math.ceil(prompt.length / this.charsPerToken) + maxTokens;
    const estimatedCost = Math.ceil(estimatedTokens * this.creditCostPerToken);

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < estimatedCost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Estimated cost: ${estimatedCost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });
      const result = await genModel.generateContent(prompt);
      const generatedText = result.response.text();

      const actualTokens = Math.ceil(
        (prompt.length + generatedText.length) / this.charsPerToken,
      );
      const actualCost = Math.ceil(actualTokens * this.creditCostPerToken);

      await this.creditsService.deductCredits(
        userId,
        actualCost,
        'AI theme detection',
        { tokensUsed: actualTokens, creditsCharged: actualCost },
      );

      return {
        message: 'Theme detected successfully',
        data: {
          generatedText,
          creditsUsed: actualCost,
          tokensUsed: actualTokens,
          remainingCredits: balance.availableCredits - actualCost,
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

    const maxTokens = 256;
    const estimatedTokens =
      Math.ceil(prompt.length / this.charsPerToken) + maxTokens;
    const estimatedCost = Math.ceil(estimatedTokens * this.creditCostPerToken);

    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < estimatedCost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Estimated cost: ${estimatedCost}`,
      });
    }

    try {
      const genModel = this.genAI.getGenerativeModel({
        model: this.defaultModel,
      });
      const result = await genModel.generateContent(prompt);
      const generatedText = result.response.text();

      const actualTokens = Math.ceil(
        (prompt.length + generatedText.length) / this.charsPerToken,
      );
      const actualCost = Math.ceil(actualTokens * this.creditCostPerToken);

      await this.creditsService.deductCredits(
        userId,
        actualCost,
        'AI scenario generation from theme',
        {
          theme: dto.theme,
          tokensUsed: actualTokens,
          creditsCharged: actualCost,
        },
      );

      return {
        message: 'Scenario generated successfully',
        data: {
          generatedText,
          creditsUsed: actualCost,
          tokensUsed: actualTokens,
          remainingCredits: balance.availableCredits - actualCost,
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

  async transcribeAudio(
    userId: string,
    file: Express.Multer.File,
    language = 'vi',
  ): Promise<GenerationResult> {
    if (!this.groq) {
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: 'Groq API key is not configured',
      });
    }

    if (!file?.buffer) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'No audio/video file provided',
      });
    }

    const fixedCost = this.transcribeCostFixed;
    const balance = (await this.creditsService.getCreditBalance(
      userId,
    )) as CreditBalance;
    if (balance.availableCredits < fixedCost) {
      throw new BadRequestException({
        errorCode: ErrorCode.INSUFFICIENT_CREDITS,
        message: `Insufficient credits. Available: ${balance.availableCredits}, Required: ${fixedCost}`,
      });
    }

    try {
      const arrayBuffer = file.buffer.buffer.slice(
        file.buffer.byteOffset,
        file.buffer.byteOffset + file.buffer.byteLength,
      ) as ArrayBuffer;
      const fileBlob = new File([arrayBuffer], file.originalname, {
        type: file.mimetype,
      });

      const transcription = await this.groq.audio.transcriptions.create({
        file: fileBlob,
        model: 'whisper-large-v3-turbo',
        language,
        response_format: 'text',
      });

      const generatedText =
        typeof transcription === 'string' ? transcription : '';

      await this.creditsService.deductCredits(
        userId,
        fixedCost,
        'Audio transcription via Groq Whisper',
        {
          fileName: file.originalname,
          fileSize: file.size,
          language,
          creditsCharged: fixedCost,
        },
      );

      return {
        message: 'Audio transcribed successfully',
        data: {
          generatedText,
          creditsUsed: fixedCost,
          tokensUsed: 0,
          remainingCredits: balance.availableCredits - fixedCost,
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
