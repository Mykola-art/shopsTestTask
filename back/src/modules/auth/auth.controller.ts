import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post, Req, UseGuards
} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserDto } from '../users/dtos';
import { TokenResponseDto } from '../../common/dtos';
import {AuthGuard} from "../../guards";
import {GetUser} from "../../decorators";
import {UserEntity} from "../../entities";
import {RefreshTokenDto} from "../../common/interfaces";
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller({path: 'auth', version: '1'})
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Returns a JWT token on successful registration',
		type: TokenResponseDto,
	})
	@ApiHeader({
		name: 'X-CSRF-Token',
		description: 'CSRF token received from GET /auth/csrf-token',
		required: true,
	})
	async register(@Body() dto: UserDto): Promise<TokenResponseDto> {
		return this.authService.register(dto);
	}

	@Post('login')
	@Throttle({ default: { limit: 6, ttl: 60_000 } })
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
	@ApiHeader({
		name: 'X-CSRF-Token',
		description: 'CSRF token received from GET /auth/csrf-token',
		required: true,
	})
	async login(@Body() dto: UserDto): Promise<TokenResponseDto> {
		console.log('////////////')
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
	@ApiHeader({
		name: 'X-CSRF-Token',
		description: 'CSRF token received from GET /auth/csrf-token',
		required: true,
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
	@ApiHeader({
		name: 'X-CSRF-Token',
		description: 'CSRF token received from GET /auth/csrf-token',
		required: true,
	})
	async logout(@GetUser() user: UserEntity):Promise<void> {
		await this.authService.logout(user.id);
	}

	@Get('csrf-token')
	@ApiOperation({ summary: 'Get CSRF token' })
	@ApiResponse({ status: 200, description: 'Returns a CSRF token', schema: {
			example: { csrfToken: 'random-generated-token' }
		}})
	getCsrfToken(@Req() req): {csrfToken: string} {
		return { csrfToken: req.csrfToken() };
	}
}
