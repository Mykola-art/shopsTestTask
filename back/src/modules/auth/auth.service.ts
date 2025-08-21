import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from "../users/users.service";
import { UserDto } from "../users/dtos";
import { TokenPayloadDto, TokenResponseDto } from "../../common/dtos";
import { JwtService } from "@nestjs/jwt";
import { UserEntity } from "../../entities";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UsersService,
		private readonly jwtService: JwtService
	) {}

	async register(data: UserDto): Promise<TokenResponseDto> {
		const candidate = await this.userService.getByEmail(data.email);
		if(candidate) throw new BadRequestException(`User with such email already exists`);

		const user = await this.userService.create(data);

		const tokens = await this.generateTokens(user);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	async login(data: UserDto): Promise<TokenResponseDto> {
		const user = await this.validateUser(data.email, data.password);

		const tokens = await this.generateTokens(user);
		await this.updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	private async validateUser(email: string, password: string): Promise<UserEntity> {
		const user = await this.userService.getByEmail(email);
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new UnauthorizedException('Invalid credentials');
		}
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
	}
}
