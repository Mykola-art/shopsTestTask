import {Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { UserRoleEnum } from '../common/enums'
import {StoreEntity} from "./store.entity";

@Entity({ name: 'users' })
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({unique: true})
	email: string

	@Column()
	password: string

	@Column({
		type: 'enum',
		enum: UserRoleEnum,
		default: UserRoleEnum.USER,
	})
	role: UserRoleEnum

	@Column({ type: 'text', nullable: true })
	refreshToken?: string | null;

	@OneToMany(() => StoreEntity, store => store.admin)
	stores: StoreEntity[];

	@BeforeInsert()
	async hashPassword(): Promise<void> {
		const saltRounds = 12
		this.password = await bcrypt.hash(this.password, saltRounds)
	}
}
