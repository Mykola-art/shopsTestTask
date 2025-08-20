import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StoreEntity } from './store.entity';
import {AvailabilityHoursInterface, ModifierInterface} from "../common/interfaces";

@Entity({ name: 'products' })
export class ProductEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => StoreEntity, store => store.products)
	store: StoreEntity;

	@Column()
	storeId: string;

	@Column()
	name: string;

	@Column('decimal')
	price: number;

	@Column({ nullable: true })
	description: string;

	@Column({ type: 'jsonb', nullable: true })
	availability: AvailabilityHoursInterface;

	@Column({ type: 'jsonb', nullable: true })
	modifiers?: ModifierInterface[];

	@Column({ default: 3600 })
	cacheTTL: number;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	lastModified: Date;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
