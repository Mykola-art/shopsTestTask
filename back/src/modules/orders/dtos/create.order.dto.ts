import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { IsValidTimezone } from 'src/common/validators';
import { OrderTypeEnum } from '../../../common/enums';
import { ModifierInterface } from '../../../common/interfaces';

export class CreateOrderDto {
	@ApiProperty({ example: 1 })
	@IsNumber()
	userId: number;

	@ApiProperty({ example: 3 })
	@IsNumber()
	productId: number;

	@ApiProperty({ enum: OrderTypeEnum, example: OrderTypeEnum.PICKUP })
	@IsEnum(OrderTypeEnum)
	type: OrderTypeEnum;

	@ApiProperty({ example: '2025-08-20T10:00:00Z' })
	@IsDateString()
	scheduleAt: Date;

	@ApiPropertyOptional({ example: 'London, Example street 34' })
	@IsOptional()
	@IsString()
	address?: string;

	@ApiProperty({ example: 'Europe/London' })
	@IsNotEmpty()
	@IsValidTimezone({ message: 'Timezone must be a valid IANA timezone string' })
	@IsString()
	timezone: string;

	@ApiPropertyOptional({ example: [{ name: 'Size', options: [{ name: 'Large', priceDelta: 2 }] }] })
	@IsOptional()
	modifiers?: ModifierInterface[];
}
