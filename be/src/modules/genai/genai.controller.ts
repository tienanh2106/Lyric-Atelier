import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { GenAIService } from './genai.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { SuggestScenarioDto } from './dto/suggest-scenario.dto';
import { MediaToTextDto } from './dto/media-to-text.dto';
import { RewriteLyricsDto } from './dto/rewrite-lyrics.dto';
import { DetectThemeDto } from './dto/detect-theme.dto';
import { ScenarioFromThemeDto } from './dto/scenario-from-theme.dto';
import {
  GenerationResponseDto,
  CostEstimationDto,
} from './dto/generation-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('GenAI')
@Controller('genai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GenAIController {
  constructor(private readonly genAIService: GenAIService) {}

  @Post('generate')
  @ApiOperation({
    operationId: 'generateContent',
    summary: 'Generate content using AI',
    description:
      'Generate text content using Google GenAI. Credits will be deducted based on token usage.',
  })
  @ApiResponse({
    status: 201,
    description: 'Content generated successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid prompt',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  generateContent(
    @CurrentUser() user: User,
    @Body() generateDto: GenerateContentDto,
  ) {
    return this.genAIService.generateContent(user.id, generateDto);
  }

  @Get('cost-estimate')
  @ApiOperation({
    operationId: 'estimateCost',
    summary: 'Estimate credit cost for generation',
    description: 'Get an estimate of credits needed for a given prompt',
  })
  @ApiResponse({
    status: 200,
    description: 'Cost estimation retrieved',
    type: CostEstimationDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  estimateCost(
    @Query('prompt') prompt: string,
    @Query('maxTokens') maxTokens?: number,
  ) {
    return this.genAIService.estimateCost(prompt, maxTokens);
  }

  @Post('rewrite-lyrics')
  @ApiOperation({
    operationId: 'rewriteLyrics',
    summary: 'Rewrite song lyrics using AI',
    description:
      'Generate Vietnamese lyrics from original text. Pass structured config; the server builds the prompt internally. Credits will be deducted based on token usage.',
  })
  @ApiResponse({
    status: 201,
    description: 'Lyrics rewritten successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid input',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  rewriteLyrics(
    @CurrentUser() user: User,
    @Body() rewriteDto: RewriteLyricsDto,
  ) {
    return this.genAIService.rewriteLyrics(user.id, rewriteDto);
  }

  @Post('detect-theme')
  @ApiOperation({
    operationId: 'detectTheme',
    summary: 'Detect theme and story from lyrics',
    description:
      'Analyse lyrics and return a theme/style name and story description. Credits will be deducted based on token usage.',
  })
  @ApiResponse({
    status: 201,
    description: 'Theme detected successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid input',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  detectTheme(
    @CurrentUser() user: User,
    @Body() detectThemeDto: DetectThemeDto,
  ) {
    return this.genAIService.detectTheme(user.id, detectThemeDto);
  }

  @Post('scenario-from-theme')
  @ApiOperation({
    operationId: 'scenarioFromTheme',
    summary: 'Generate a scenario based on music theme',
    description:
      'Given a theme/style name, generate a short scenario description for song lyric writing. Credits will be deducted based on token usage.',
  })
  @ApiResponse({
    status: 201,
    description: 'Scenario generated successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid input',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  scenarioFromTheme(
    @CurrentUser() user: User,
    @Body() scenarioFromThemeDto: ScenarioFromThemeDto,
  ) {
    return this.genAIService.scenarioFromTheme(user.id, scenarioFromThemeDto);
  }

  @Post('suggest-scenario')
  @ApiOperation({
    operationId: 'suggestScenario',
    summary: 'Suggest AI generation scenarios',
    description:
      'Propose creative scenarios/ideas based on user prompt. Credits will be deducted based on token usage.',
  })
  @ApiResponse({
    status: 201,
    description: 'Scenarios suggested successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid prompt',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  suggestScenario(
    @CurrentUser() user: User,
    @Body() suggestDto: SuggestScenarioDto,
  ) {
    return this.genAIService.suggestScenario(user.id, suggestDto);
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    operationId: 'transcribeAudio',
    summary: 'Transcribe audio/video to text using Gemini Flash multimodal',
    description:
      'Upload an audio or video file and transcribe lyrics using Gemini Flash. ' +
      'mode=karaoke: returns ALL repeated sections in order (for karaoke sync). ' +
      'mode=lyrics (default): returns unique song structure without repetition (for lyric rewriting).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        language: { type: 'string', example: 'vi', default: 'vi' },
        mode: {
          type: 'string',
          enum: ['lyrics', 'karaoke'],
          default: 'lyrics',
          description:
            'lyrics = unique structure for rewriting; karaoke = full with all repetitions',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Audio transcribed successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid file',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  transcribeAudio(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('language') language?: string,
    @Body('mode') mode?: string,
  ) {
    return this.genAIService.transcribeAudio(user.id, file, language, mode);
  }

  @Post('sync-karaoke')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    operationId: 'syncKaraoke',
    summary: 'Sync lyrics with audio using AI',
    description:
      'Upload audio file with raw lyrics text. Gemini maps provided lyrics → segment timestamps (fast, accurate for given text); Whisper CTC provides word-onset timing. Both run in parallel. Dynamic cost based on lyric word count.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        rawLyrics: { type: 'string', example: 'Dòng 1\nDòng 2' },
      },
      required: ['file', 'rawLyrics'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Karaoke synced successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid input',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  syncKaraoke(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('rawLyrics') rawLyrics: string,
  ) {
    return this.genAIService.syncKaraoke(user.id, file, rawLyrics);
  }

  @Post('media-to-text')
  @ApiOperation({
    operationId: 'mediaToText',
    summary: 'Convert audio/video to text',
    description:
      'Convert audio or video file to text using AI. Supports transcription with custom prompts. Credits will be deducted based on token usage.',
  })
  @ApiResponse({
    status: 201,
    description: 'Media transcribed successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid media URL',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  mediaToText(@CurrentUser() user: User, @Body() mediaDto: MediaToTextDto) {
    return this.genAIService.mediaToText(user.id, mediaDto);
  }
}
