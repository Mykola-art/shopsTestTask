import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class IdDto {
  @ApiProperty({ example: 1, description: 'ID магазину' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id: number;
}
