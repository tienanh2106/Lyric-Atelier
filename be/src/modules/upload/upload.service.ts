import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ErrorCode } from '../../common/enums/error-code.enum';

interface ValidatedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

function isValidFile(
  file: Express.Multer.File | undefined,
): file is Express.Multer.File & ValidatedFile {
  return !!(
    file?.buffer &&
    file.mimetype &&
    file.originalname &&
    typeof file.size === 'number'
  );
}

export interface UploadResult {
  message: string;
  data: {
    uri: string;
    fileId: string;
    fileName: string;
    contentType: string;
    size: number;
  };
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly fileManager: GoogleAIFileManager;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('genai.apiKey');
    if (!apiKey) {
      throw new Error('Google GenAI API key is not configured');
    }
    this.fileManager = new GoogleAIFileManager(apiKey);
  }

  async uploadMedia(
    file: Express.Multer.File | undefined,
  ): Promise<UploadResult> {
    if (!isValidFile(file)) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'No file provided or file is invalid',
      });
    }

    const allowedMimeTypes: string[] = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      });
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_PROMPT,
        message: 'File size exceeds 100MB limit',
      });
    }

    // Write buffer to a temp file because GoogleAIFileManager requires a file path
    const tempPath = path.join(
      os.tmpdir(),
      `${Date.now()}-${file.originalname}`,
    );

    try {
      fs.writeFileSync(tempPath, file.buffer);

      const uploadResponse = await this.fileManager.uploadFile(tempPath, {
        mimeType: file.mimetype,
        displayName: file.originalname,
      });

      this.logger.log(
        `File uploaded to Gemini Files API: ${uploadResponse.file.name}`,
      );

      return {
        message: 'File uploaded successfully',
        data: {
          uri: uploadResponse.file.uri,
          fileId: uploadResponse.file.name,
          fileName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to upload file: ${errorMessage}`,
      });
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  async deleteMedia(fileId: string): Promise<{ message: string }> {
    try {
      await this.fileManager.deleteFile(fileId);
      this.logger.log(`File deleted from Gemini Files API: ${fileId}`);
      return { message: 'File deleted successfully' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException({
        errorCode: ErrorCode.GENERATION_FAILED,
        message: `Failed to delete file: ${errorMessage}`,
      });
    }
  }
}
