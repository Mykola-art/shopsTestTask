import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from "../users/users.service";
import { UserDto } from "../users/dtos";
import { TokenPayloadDto, TokenResponseDto } from "../../common/dtos";
import { JwtService } from "@nestjs/jwt";
import { UserEntity } from "../../entities";
import { AuditEventType } from 'src/common/enums/audit.event.type.enum';
import { AuditService } from '../audit/audit.service';
import {LOCKOUT_DURATION_MINUTES, MAX_FAILED_ATTEMPTS } from 'src/common/constants/login.constants';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UsersService,
		private readonly jwtService: JwtService,
		private readonly auditService: AuditService
	) {}

	async register(data: UserDto): Promise<TokenResponseDto> {
		const candidate = await this.userService.getByEmail(data.email);
		if(candidate) throw new BadRequestException(`User with such email already exists`);
		const user = await this.userService.create(data);
		const tokens = await this.generateTokens(user);
		await this.updateRefreshToken(user.id, tokens.refreshToken);
		await this.auditService.log(AuditEventType.REGISTRER_USER, user.id);
		return tokens;
	}

	async login(data: UserDto): Promise<TokenResponseDto> {
		const user = await this.validateUser(data.email, data.password);
		const tokens = await this.generateTokens(user);
		await this.updateRefreshToken(user.id, tokens.refreshToken);
   
		await this.auditService.log(AuditEventType.LOGIN, user.id);

		return tokens;
	}

	async validateUser(email: string, password: string): Promise<UserEntity> {
		const user = await this.userService.getByEmail(email)

		if (!user) throw new UnauthorizedException('Invalid credentials');
		
		if (user.lockoutUntil && user.lockoutUntil > new Date()) {
			throw new ForbiddenException('Account is temporarily locked. Try later.');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			user.failedLoginAttempts += 1;

			if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
				user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
				user.failedLoginAttempts = 0; 
			}

			await this.userService.saveUser(user);
			throw new UnauthorizedException('Invalid credentials');
		}
		
		user.failedLoginAttempts = 0;
		user.lockoutUntil = null;
		await this.userService.saveUser(user);

		return user;
	}


	private generateToken(payload: TokenPayloadDto, expiresIn: string): string {
		return this.jwtService.sign(payload, { expiresIn });
	}

	private async generateTokens(user: UserEntity): Promise<TokenResponseDto> {
		const accessToken = this.generateToken({ id: user.id }, '1h');
		const refreshToken = this.generateToken({ id: user.id }, '7d');
		return {
			accessToken,
			refreshToken,
			userPayload: {
				userId: user.id,
				email: user.email,
				role: user.role,
				isHaveStores: !!user?.stores?.length
			}
		};
	}

	private async updateRefreshToken(userId: number, refreshToken: string) {
		const hashedToken = await bcrypt.hash(refreshToken, 12);
		await this.userService.updateRefreshToken(userId, hashedToken);
	}

	async refreshToken(userId: number, refreshToken: string): Promise<TokenResponseDto> {
		const user = await this.userService.getById(userId);
		if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid refresh token');

		const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
		if (!isValid) throw new UnauthorizedException('Invalid refresh token');

		const tokens = await this.generateTokens(user);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async logout(userId: number):Promise<void> {
		await this.userService.removeRefreshToken(userId);
		await this.auditService.log(AuditEventType.LOGOUT, userId);
	}
}
