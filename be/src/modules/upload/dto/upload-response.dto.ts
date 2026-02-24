import { ApiProperty } from '@nestjs/swagger';

export class UploadDataDto {
  @ApiProperty({
    description:
      'Gemini Files API URI - use this directly as mediaUrl in media-to-text',
    example: 'https://generativelanguage.googleapis.com/v1beta/files/abc123xyz',
  })
  uri: string;

  @ApiProperty({
    description: 'File ID in Gemini Files API (use this to delete the file)',
    example: 'files/abc123xyz',
  })
  fileId: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'song.mp3',
  })
  fileName: string;

  @ApiProperty({
    description: 'Content type of the file',
    example: 'audio/mpeg',
  })
  contentType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 5242880,
  })
  size: number;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'File uploaded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Upload data',
    type: UploadDataDto,
  })
  data: UploadDataDto;
}
