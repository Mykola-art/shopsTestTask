import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'your-refresh-token-here' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
