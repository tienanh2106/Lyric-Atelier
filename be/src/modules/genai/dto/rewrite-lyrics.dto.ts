import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RewriteLyricsDto {
  @ApiProperty({
    description: 'Original lyrics text to rewrite',
    example: '无法继续下去\n心已破碎成片',
  })
  @IsString()
  @MinLength(1)
  originalText: string;

  @ApiPropertyOptional({
    description: 'Source language of the original lyrics',
    example: 'zh',
    default: 'auto',
    enum: ['auto', 'vi', 'zh', 'ko', 'en', 'ja'],
  })
  @IsOptional()
  @IsString()
  sourceLanguage?: string;

  @ApiPropertyOptional({
    description: 'Music theme / style for the rewritten lyrics',
    example: 'TrendyPop',
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({
    description: 'Story/scenario description to guide the rewriting',
    example: 'Chàng trai nhớ về mối tình đầu đã chia tay',
  })
  @IsOptional()
  @IsString()
  storyDescription?: string;

  @ApiPropertyOptional({
    description: 'Singer gender — affects pronoun and tone choices',
    example: 'female',
    default: 'female',
    enum: ['male', 'female'],
  })
  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;

  @ApiPropertyOptional({
    description:
      '"strict" = Đồng điệu 100% (match syllable count + tones). "creative" = Sáng tác tự do (free creative flow)',
    example: 'strict',
    default: 'strict',
    enum: ['strict', 'creative'],
  })
  @IsOptional()
  @IsIn(['strict', 'creative'])
  mode?: string;

  @ApiPropertyOptional({
    description:
      'Use the thinking model (higher quality, slower & more expensive)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  useThinking?: boolean;
}
