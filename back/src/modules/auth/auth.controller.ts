import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post, UseGuards
} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserDto } from '../users/dtos';
import { TokenResponseDto } from '../../common/dtos';
import {AuthGuard} from "../../guards";
import {GetUser} from "../../decorators";
import {UserEntity} from "../../entities";
import {RefreshTokenDto} from "../../common/interfaces";
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Returns a JWT token on successful registration',
		type: TokenResponseDto,
	})
	async register(@Body() dto: UserDto): Promise<TokenResponseDto> {
		return this.authService.register(dto);
	}

	@Post('login')
	@Throttle({ default: { limit: 3, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login user' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns a JWT token on successful login',
		type: TokenResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Invalid credentials',
	})
	async login(@Body() dto: UserDto): Promise<TokenResponseDto> {
		return this.authService.login(dto);
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Refresh access token using refresh token' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns new access & refresh tokens',
		type: TokenResponseDto,
	})
	async refresh(@Body() body: RefreshTokenDto): Promise<TokenResponseDto> {
		return this.authService.refreshToken(body.userId, body.refreshToken);
	}

	@Post('logout')
	@UseGuards(AuthGuard)
	@ApiBearerAuth()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Logout user and invalidate refresh token' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Refresh token removed successfully',
	})
	async logout(@GetUser() user: UserEntity):Promise<void> {
		await this.authService.logout(user.id);
	}
}
