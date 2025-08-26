import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';
import { OrderTypeEnum } from '../../../common/enums';
import { Type } from 'class-transformer';
import { IsValidTimezone } from '../../../common/validators';

export class FindOrdersQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
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

  @ApiProperty({ example: 'Monday', required: false })
  @IsOptional()
  @IsString()
  day?: string;

  @ApiPropertyOptional({
    example: 'London',
    description: 'Filter by address (like)',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Europe/London', required: false })
  @IsOptional()
  @IsValidTimezone({ message: 'Timezone must be a valid IANA timezone string' })
  @IsString()
  timezone?: string;
}
