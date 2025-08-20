import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {Type} from "class-transformer";

export class GetActiveProductsQueryDto {
	@ApiProperty({ example: 1, description: 'ID магазину' })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	storeId: number;

	@ApiProperty({ example: 'Europe/London', description: 'Часова зона для переведення часу' })
	@IsString()
	timezone: string;

	@ApiProperty({ example: '10:30', description: 'Час у форматі HH:mm для перевірки доступних продуктів' })
	@IsString()
	time: string;

	@ApiProperty({ example: 1, description: 'Номер сторінки', required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	page: number = 1;

	@ApiProperty({ example: 10, description: 'Кількість елементів на сторінку', required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	limit: number = 10;
}
