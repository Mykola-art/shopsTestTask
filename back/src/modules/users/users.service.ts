import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import * as bcrypt from 'bcrypt'
import {UserEntity} from "../../entities";
import {UserDto} from "./dtos";

@Injectable()
export class UsersService {
	constructor(@InjectRepository(UserEntity)
	            private readonly usersRepository: Repository<UserEntity>) {
	}

	async create(data: UserDto): Promise<UserEntity>{
		const user = await this.usersRepository.create(data)
		return this.usersRepository.save(user)
	}

	async getById(id: number): Promise<UserEntity | null>{
		return this.usersRepository.findOneById(id)
	}

	async getByEmail(email: string): Promise<UserEntity | null>{
		return this.usersRepository.findOne({where: {email}, relations: ["stores"]})
	}

	async updateRefreshToken(userId: number, refreshToken: string) {
		const hashedToken = await bcrypt.hash(refreshToken, 12);
		const user = await this.getById(userId);
		if (!user) throw new NotFoundException('User not found');

		user.refreshToken = hashedToken;
		await this.usersRepository.save(user);
	}

	async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
		const user = await this.getById(userId);
		if (!user || !user.refreshToken) return false;

		const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
		return isValid;
	}

	async removeRefreshToken(userId: number) {
		const user = await this.getById(userId);
		if (!user) throw new NotFoundException('User not found');

		user.refreshToken = null;
		await this.usersRepository.save(user);
	}
}
