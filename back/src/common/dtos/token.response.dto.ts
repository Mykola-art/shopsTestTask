import { ApiProperty } from '@nestjs/swagger';
import {UserRoleEnum} from "../enums";

class UserPayload {
	@ApiProperty({ example: 1 })
	userId: number;

	@ApiProperty({ example: 'user@example.com' })
	email: string;

	@ApiProperty({ enum: UserRoleEnum, example: UserRoleEnum.USER })
	role: UserRoleEnum;

	@ApiProperty({ example: true })
	isHaveStores: boolean;
}


export class TokenResponseDto {
	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
	accessToken: string;

	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
	refreshToken: string

	@ApiProperty({type: ()=> UserPayload})
	userPayload: UserPayload
}
