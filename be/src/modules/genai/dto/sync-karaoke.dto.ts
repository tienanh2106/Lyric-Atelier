import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncKaraokeDto {
  @ApiProperty({
    description: 'Raw song lyrics text to sync with audio',
    example: 'Dòng thứ nhất\nDòng thứ hai',
  })
  @IsString()
  @MinLength(1)
  rawLyrics: string;
}
