import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import {UsersService} from "../modules/users/users.service";
import {TokenPayloadDto} from "../common/dtos";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly usersService: UsersService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const authHeader = request.headers['authorization'];

		if (!authHeader) throw new UnauthorizedException('Authorization header missing');

		const [bearer, token] = authHeader.split(' ');

		if (bearer !== 'Bearer' || !token) throw new UnauthorizedException('Invalid token format');

		try {
			const payload: TokenPayloadDto = await this.jwtService.verifyAsync(token, {
				secret: this.configService.get<string>('JWT_SECRET'),
			});

			const user = await this.usersService.getById(payload.id)

			request['user'] = user;
			return true;
		} catch (err) {
			throw new UnauthorizedException('Token verification failed');
		}
	}
}
