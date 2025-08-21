import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { IsValidTimezone } from 'src/common/validators';

export class FindStoresQueryDto {
	@ApiPropertyOptional({ example: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	page: number = 1;

	@ApiPropertyOptional({ example: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	limit: number = 10;

	@ApiProperty({ example: 'Europe/London', required: false })
	@IsOptional()
	@IsValidTimezone({ message: 'Timezone must be a valid IANA timezone string' })
	@IsString()
	timezone?: string;

	@ApiPropertyOptional({ example: 'Shop name' })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ example: 'Kyiv, UA' })
	@IsOptional()
	@IsString()
	address?: string;

	@ApiPropertyOptional({ example: 'Tuesday' })
	@IsOptional()
	@IsString()
	day?: string;

	@ApiPropertyOptional({ example: '10:00' })
	@IsOptional()
	@IsString()
	from?: string;

	@ApiPropertyOptional({ example: '13:00' })
	@IsOptional()
	@IsString()
	to?: string;
}