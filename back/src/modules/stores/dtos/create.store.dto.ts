import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';
import { AvailabilityHoursInterface } from '../../../common/interfaces';

export class CreateStoreDto {
	@ApiProperty({ example: 'my-store' })
	@IsNotEmpty()
	@IsString()
	slug: string;

	@ApiProperty({ example: 'My Test Store' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ example: '123 Street, City' })
	@IsNotEmpty()
	@IsString()
	address: string;

	@ApiProperty({ example: 'Europe/Kyiv' })
	@IsNotEmpty()
	@IsString()
	timezone: string;

	@ApiProperty({ example: 50.4501 })
	@IsNumber()
	lat: number;

	@ApiProperty({ example: 30.5234 })
	@IsNumber()
	lng: number;

	@ApiProperty({
		example: { Monday: { from: '10:00', to: '16:00' } },
		required: false,
	})
	@IsOptional()
	@IsObject()
	operatingHours?: AvailabilityHoursInterface;
}