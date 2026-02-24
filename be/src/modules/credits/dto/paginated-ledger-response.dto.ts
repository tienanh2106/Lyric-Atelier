import { ApiProperty } from '@nestjs/swagger';
import { CreditLedger } from '../entities/credit-ledger.entity';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

export class PaginatedLedgerResponseDto {
  @ApiProperty({
    description: 'List of credit ledger entries',
    type: [CreditLedger],
  })
  data: CreditLedger[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
