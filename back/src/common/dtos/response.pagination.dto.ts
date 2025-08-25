import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  pageSize: number;

  @ApiProperty({ example: 100 })
  totalPages: number;

  @ApiProperty({ example: 1000 })
  total: number;
}

export class PaginationResponseDto<T> {
  @ApiProperty({ type: () => PaginationMeta })
  meta: PaginationMeta;

  @ApiProperty({ isArray: true })
  items: T[];
}
