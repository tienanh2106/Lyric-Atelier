import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DetectThemeDto {
  @ApiProperty({
    description: 'Original lyrics text to analyse for theme and story',
    example: '无法继续下去\n心已破碎成片',
  })
  @IsString()
  @MinLength(1)
  lyrics: string;
}
