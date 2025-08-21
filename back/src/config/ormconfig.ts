import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import {UserEntity, StoreEntity, ProductEntity, OrderEntity, AuditLogEntity} from '../entities';


dotenv.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	entities: [UserEntity, StoreEntity, ProductEntity, OrderEntity, AuditLogEntity],
	migrations: ['../../migrations/*.ts'],
	synchronize: false,
});
