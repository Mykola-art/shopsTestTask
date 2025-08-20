import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import {Type} from "class-transformer";

export class FindProductsQueryDto {
	@ApiProperty({ example: 1, required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	page?: number = 1;

	@ApiProperty({ example: 10, required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	limit?: number = 10;

	@ApiProperty({ example: 'Europe/London', required: false })
	@IsOptional()
	@IsString()
	timezone?: string;


	@ApiProperty({ example: 'Pizza', required: false })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({ example: 5, required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	priceFrom?: number;

	@ApiProperty({ example: 20, required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	priceTo?: number;

	@ApiProperty({ example: 'Monday', required: false })
	@IsOptional()
	@IsString()
	day?: string;

	@ApiProperty({ example: '08:00', required: false })
	@IsOptional()
	@IsString()
	from?: string;

	@ApiProperty({ example: '11:00', required: false })
	@IsOptional()
	@IsString()
	to?: string;
}