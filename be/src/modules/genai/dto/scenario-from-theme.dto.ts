import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScenarioFromThemeDto {
  @ApiProperty({
    description: 'Music theme/style used to inspire the scenario',
    example: 'TrendyPop',
  })
  @IsString()
  @MinLength(1)
  theme: string;
}
