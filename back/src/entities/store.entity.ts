import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ProductEntity} from './product.entity';
import {AvailabilityHoursInterface} from "../common/interfaces";

@Entity({ name: 'stores' })
export class StoreEntity {
	@PrimaryGeneratedColumn()
	id: string;

	@Column({ unique: true })
	slug: string;

	@Column()
	name: string;

	@Column()
	address: string;

	@Column()
	timezone: string;

	@Column('decimal', { precision: 10, scale: 6 })
	lat: number;

	@Column('decimal', { precision: 10, scale: 6 })
	lng: number;

	@Column({ type: 'jsonb', nullable: true })
	operatingHours: AvailabilityHoursInterface;

	@ManyToOne(() => UserEntity, user => user.stores)
	admin: UserEntity;

	@OneToMany(() => ProductEntity, product => product.store)
	products: ProductEntity[];

	@Column({ type: 'timestamp', nullable: true })
	nextOpenTime?: Date;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
