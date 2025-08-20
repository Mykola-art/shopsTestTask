import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {OrderEntity, ProductEntity, StoreEntity, UserEntity} from "../entities";

export const typeormModuleOptions = (config: ConfigService): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: config.getOrThrow<string>('DB_HOST'),
	port: config.getOrThrow<number>('DB_PORT'),
	username: config.getOrThrow<string>('DB_USER'),
	password: config.getOrThrow<string>('DB_PASSWORD'),
	database: config.getOrThrow<string>('DB_NAME'),
	synchronize: true,
	entities: [UserEntity, StoreEntity, ProductEntity, OrderEntity],
	migrations: ['src/migrations/*.ts'],
});

