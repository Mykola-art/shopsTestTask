import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import { OrderTypeEnum } from '../common/enums';
import { ModifierInterface } from '../common/interfaces';

@Entity({ name: 'orders' })
export class OrderEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column()
  userId: number;

  @ApiProperty({ example: 3 })
  @Column()
  productId: number;

  @ApiProperty({ enum: OrderTypeEnum, example: OrderTypeEnum.PICKUP })
  @Column({
    type: 'enum',
    enum: OrderTypeEnum,
    default: OrderTypeEnum.PICKUP,
  })
  type: OrderTypeEnum;

  @ApiProperty({ example: '2025-08-21T12:00:00Z' })
  @Column({ type: 'timestamptz' })
  scheduleAt: Date;

  @ApiProperty({ example: 'London, Example street 34' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ example: 'Europe/London' })
  @Column()
  timezone: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isAccepted: boolean;

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;
}
