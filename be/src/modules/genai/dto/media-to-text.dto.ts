import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export class MediaToTextDto {
  @ApiProperty({
    description:
      'URI of the file from Gemini Files API (from the uri field in upload response)',
    example: 'https://generativelanguage.googleapis.com/v1beta/files/abc123xyz',
  })
  @IsString()
  @IsUrl()
  mediaUrl: string;

  @ApiProperty({
    description: 'Media type (audio or video)',
    enum: MediaType,
    example: MediaType.AUDIO,
  })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiPropertyOptional({
    description:
      'MIME type of the file. If omitted, defaults to audio/mpeg for audio and video/mp4 for video.',
    example: 'audio/mpeg',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description:
      'Additional prompt to guide AI processing (e.g., "Transcribe this song lyrics")',
    example: 'Transcribe the audio and format as song lyrics',
  })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({
    description: 'Language of the media content',
    example: 'vi',
    default: 'vi',
  })
  @IsOptional()
  @IsString()
  language?: string;
}
