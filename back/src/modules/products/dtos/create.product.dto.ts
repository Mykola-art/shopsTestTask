import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Pizza Margherita' })
  @IsString()
  name: string;

  @ApiProperty({ example: 12.99 })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'Classic pizza with tomato sauce and cheese',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: { Monday: { from: '08:00', to: '11:00' } },
    required: false,
  })
  @IsOptional()
  availability?: Record<string, { from: string; to: string }>;

  @ApiProperty({
    example: [{ name: 'Size', options: [{ name: 'Large', priceDelta: 2 }] }],
    required: false,
  })
  @IsOptional()
  modifiers?: any[];

  @ApiProperty({ example: 3600, required: false })
  @IsOptional()
  @IsNumber()
  cacheTTL?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  storeId: number;
}
