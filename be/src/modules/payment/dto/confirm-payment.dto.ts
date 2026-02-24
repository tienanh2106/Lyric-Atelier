import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Credit package ID to confirm payment for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  packageId: string;
}
