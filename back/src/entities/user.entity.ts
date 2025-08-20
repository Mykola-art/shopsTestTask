import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from '../common/enums';
import { StoreEntity } from './store.entity';
import { ApiProperty } from '@nestjs/swagger';
import {ProductEntity} from "./product.entity";
import {OrderEntity} from "./order.entity";

@Entity({ name: 'users' })
export class UserEntity {
	@ApiProperty({ example: 1 })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ example: 'user@example.com' })
	@Column({ unique: true })
	email: string;

	@ApiProperty({ example: 'hashed-password', description: 'Hashed user password' })
	@Column()
	password: string;

	@ApiProperty({ enum: UserRoleEnum, example: UserRoleEnum.USER })
	@Column({
		type: 'enum',
		enum: UserRoleEnum,
		default: UserRoleEnum.USER,
	})
	role: UserRoleEnum;

	@ApiProperty({ example: null, required: false })
	@Column({ type: 'text', nullable: true })
	refreshToken?: string | null;

	@ApiProperty({ type: () => [StoreEntity], required: false })
	@OneToMany(() => StoreEntity, store => store.admin)
	stores: StoreEntity[];

	@ApiProperty({ type: () => [OrderEntity] })
	@OneToMany(() => OrderEntity, order => order.user)
	orders: OrderEntity[];

	@BeforeInsert()
	async hashPassword(): Promise<void> {
		const saltRounds = 12;
		this.password = await bcrypt.hash(this.password, saltRounds);
	}
}
