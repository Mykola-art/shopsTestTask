import { ApiProperty } from '@nestjs/swagger';

export class ResponseStoreDashboardDto {
  @ApiProperty({ example: 1 })
  storeId: number;

  @ApiProperty({
    example: 12,
    description: 'Total number of products in the store',
  })
  productsCount: number;

  @ApiProperty({ example: 34, description: 'Total number of orders' })
  ordersCount: number;

  @ApiProperty({ example: 20, description: 'Number of accepted orders' })
  acceptedOrders: number;

  @ApiProperty({ example: 14, description: 'Number of pending orders' })
  pendingOrders: number;

  @ApiProperty({
    example: 18,
    description: 'Number of past orders (scheduleAt <= now)',
  })
  pastOrders: number;

  @ApiProperty({
    example: 16,
    description: 'Number of upcoming orders (scheduleAt > now)',
  })
  upcomingOrders: number;
}
