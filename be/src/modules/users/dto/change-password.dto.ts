import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'OldPass@123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (min 8 chars)',
    example: 'NewPass@456',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
