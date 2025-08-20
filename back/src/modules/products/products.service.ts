import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../entities';
import { CreateProductDto, UpdateProductDto, FindProductsQueryDto } from './dtos';
import { PaginationResponseDto } from '../../common/dtos';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(ProductEntity)
		private readonly productRepository: Repository<ProductEntity>,
	) {}

	async create(dto: CreateProductDto): Promise<ProductEntity> {
		const product = this.productRepository.create(dto);
		return this.productRepository.save(product);
	}

	async findAll(query: FindProductsQueryDto): Promise<PaginationResponseDto<ProductEntity>> {
		const { page = 1, limit = 10, name, priceFrom, priceTo, day, from, to } = query;
		const qb = this.productRepository.createQueryBuilder('product');

		if (name) {
			qb.andWhere('LOWER(product.name) LIKE LOWER(:name)', { name: `%${name}%` });
		}

		if (priceFrom != null) {
			qb.andWhere('product.price >= :priceFrom', { priceFrom });
		}

		if (priceTo != null) {
			qb.andWhere('product.price <= :priceTo', { priceTo });
		}

		if (day && from && to) {
			qb.andWhere(
				`product.availability -> :day ->> 'from' <= :from AND product.availability -> :day ->> 'to' >= :to`,
				{ day, from, to },
			);
		}

		qb.skip((page - 1) * limit).take(limit);

		const [items, total] = await qb.getManyAndCount();
		return {
			items,
			meta: {
				page,
				pageSize: limit,
				totalPages: Math.ceil(total / limit),
				total
			},
		};
	}

	async findOne(id: number): Promise<ProductEntity> {
		const product = await this.productRepository.findOneBy({ id });
		if (!product) throw new NotFoundException('Product not found');
		return product
	}

	async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
		await this.productRepository.update(id, dto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.productRepository.delete(id);
	}
}
