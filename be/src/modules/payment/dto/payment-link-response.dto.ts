import { ApiProperty } from '@nestjs/swagger';

export class PaymentLinkResponseDto {
  @ApiProperty({ example: 'https://pay.payos.vn/web/...' })
  checkoutUrl: string;

  @ApiProperty({ example: 1234567890 })
  orderCode: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  packageId: string;

  @ApiProperty({ example: 50000 })
  amount: number;

  @ApiProperty({ example: 100 })
  credits: number;
}

export class ConfirmPaymentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 100 })
  credits: number;

  @ApiProperty({ example: 'Gói Starter' })
  packageName: string;
}
