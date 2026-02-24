import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
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
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('media')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    operationId: 'uploadMedia',
    summary: 'Upload media file (audio/video)',
    description:
      'Upload an audio or video file to Gemini Files API. Returns uri and fileId for use with the media-to-text API. Files are automatically deleted after 48 hours. Max file size: 100MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Media file (audio or video)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or file too large',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadMedia(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.uploadService.uploadMedia(file);
  }

  @Delete('media/*fileName')
  @ApiOperation({
    operationId: 'deleteMedia',
    summary: 'Delete media file from Gemini Files API',
    description:
      'Delete a file from Gemini Files API. Provide the fileId received from the upload response (e.g., files/abc123xyz).',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'File deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'File not found or delete failed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteMedia(@Param('fileName') fileName: string) {
    return this.uploadService.deleteMedia(fileName);
  }
}
