import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateNeonThemeDto {
  @ApiProperty({
    description: 'Mood/style description to generate a neon visualizer theme',
    example: 'upbeat synthwave',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  mood: string;
}
