import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import { AvailabilityHoursInterface } from '../common/interfaces';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'stores' })
export class StoreEntity {
	@ApiProperty({ example: 1 })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ example: 'my-store' })
	@Column({ unique: true })
	slug: string;

	@ApiProperty({ example: 'My Test Store' })
	@Column()
	name: string;

	@ApiProperty({ example: '123 Street, City' })
	@Column()
	address: string;

	@ApiProperty({ example: 'Europe/Kyiv' })
	@Column()
	timezone: string;

	@ApiProperty({ example: 50.4501 })
	@Column('decimal', { precision: 10, scale: 6 })
	lat: number;

	@ApiProperty({ example: 30.5234 })
	@Column('decimal', { precision: 10, scale: 6 })
	lng: number;

	@ApiProperty({
		example: { Tuesday: { from: '10:00', to: '17:00' } }
	})
	@Column({ type: 'jsonb', nullable: true })
	operatingHours: AvailabilityHoursInterface;

	@ApiProperty({ type: () => UserEntity })
	@ManyToOne(() => UserEntity, user => user.stores)
	admin: UserEntity;

	@ApiProperty({ type: () => [ProductEntity] })
	@OneToMany(() => ProductEntity, product => product.store)
	products: ProductEntity[];

	@ApiProperty({ example: '2024-01-01T12:00:00Z' })
	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@ApiProperty({ example: '2024-01-15T08:00:00Z' })
	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
