import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum, IsString, IsDateString } from 'class-validator';
import { OrderTypeEnum } from '../../../common/enums';

export class FindOrdersQueryDto {
	@ApiPropertyOptional({ example: 1 })
	@IsOptional()
	page?: number = 1;

	@ApiPropertyOptional({ example: 10 })
	@IsOptional()
	limit?: number = 10;

	@ApiPropertyOptional({ example: true })
	@IsOptional()
	@IsBoolean()
	isAccepted?: boolean;

	@ApiPropertyOptional({ enum: OrderTypeEnum })
	@IsOptional()
	@IsEnum(OrderTypeEnum)
	type?: OrderTypeEnum;

	@ApiPropertyOptional({ example: '2025-08-20T10:00:00Z' })
	@IsOptional()
	@IsDateString()
	scheduleFrom?: Date;

	@ApiPropertyOptional({ example: '2025-08-20T15:00:00Z' })
	@IsOptional()
	@IsDateString()
	scheduleTo?: Date;

	@ApiPropertyOptional({ example: 'London', description: 'Filter by address (like)' })
	@IsOptional()
	@IsString()
	address?: string;
}
