import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StoreEntity } from './store.entity';
import { AvailabilityHoursInterface, ModifierInterface } from '../common/interfaces';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class ProductEntity {
	@ApiProperty({ example: 1 })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ type: () => StoreEntity })
	@ManyToOne(() => StoreEntity, store => store.products)
	store: StoreEntity;

	@ApiProperty({ example: 1 })
	@Column()
	storeId: number;

	@ApiProperty({ example: 'Pizza Margherita' })
	@Column()
	name: string;

	@ApiProperty({ example: 12.99 })
	@Column('decimal')
	price: number;

	@ApiProperty({ example: 'Classic pizza with tomato sauce and cheese', required: false })
	@Column({ nullable: true })
	description: string;

	@ApiProperty({
		example: { Monday: { from: '08:00', to: '11:00' } },
	})
	@Column({ type: 'jsonb', nullable: true })
	availability: AvailabilityHoursInterface;

	@ApiProperty({
		example: [
			{
				name: 'Size',
				options: [{ name: 'Large', priceDelta: 2 }],
			},
		],
		required: false,
	})
	@Column({ type: 'jsonb', nullable: true })
	modifiers?: ModifierInterface[];

	@ApiProperty({ example: 3600 })
	@Column({ default: 3600 })
	cacheTTL: number;

	@ApiProperty({ example: '2024-01-01T09:58:00Z' })
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@ApiProperty({ example: '2024-01-01T09:58:00Z' })
	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
