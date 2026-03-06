import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Display name', example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}
