import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [User],
  })
  data: User[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
