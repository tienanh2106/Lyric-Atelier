import { ApiProperty } from '@nestjs/swagger';
import { CreditTransaction } from '../entities/credit-transaction.entity';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

export class PaginatedTransactionResponseDto {
  @ApiProperty({
    description: 'List of credit transactions',
    type: [CreditTransaction],
  })
  data: CreditTransaction[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
