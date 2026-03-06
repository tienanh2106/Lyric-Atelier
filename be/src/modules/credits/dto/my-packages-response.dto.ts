import { ApiProperty } from '@nestjs/swagger';

export class PackageBreakdownDto {
  @ApiProperty({ description: 'Ledger entry ID', example: 'uuid' })
  ledgerId: string;

  @ApiProperty({ description: 'Package name', example: 'Pro' })
  packageName: string;

  @ApiProperty({ description: 'Purchase date' })
  purchasedAt: Date;

  @ApiProperty({ description: 'Expiry date', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ description: 'Total credits in this package', example: 575 })
  creditsTotal: number;

  @ApiProperty({ description: 'Credits used from this package', example: 120 })
  creditsUsed: number;

  @ApiProperty({ description: 'Credits remaining', example: 455 })
  creditsRemaining: number;

  @ApiProperty({
    description: 'Whether this package has expired',
    example: false,
  })
  isExpired: boolean;

  @ApiProperty({
    description:
      'Days until expiry, null if no expiry or already expired',
    nullable: true,
    example: 45,
  })
  daysUntilExpiry: number | null;
}

export class MyPackagesResponseDto {
  @ApiProperty({ description: 'Available credits balance', example: 455 })
  availableCredits: number;

  @ApiProperty({ description: 'Total credits ever purchased', example: 575 })
  totalCredits: number;

  @ApiProperty({ description: 'Total credits used', example: 120 })
  usedCredits: number;

  @ApiProperty({ description: 'Total credits expired', example: 0 })
  expiredCredits: number;

  @ApiProperty({ description: 'Credits expiring within 7 days', example: 0 })
  creditsExpiringSoon: number;

  @ApiProperty({ type: [PackageBreakdownDto] })
  packages: PackageBreakdownDto[];
}
