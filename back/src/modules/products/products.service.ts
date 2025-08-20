import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {DateTime} from 'luxon';
import { ProductEntity } from '../../entities';
import {CreateProductDto, UpdateProductDto, FindProductsQueryDto, GetActiveProductsQueryDto} from './dtos';
import { PaginationResponseDto } from '../../common/dtos';
import {ConvertTimeByTimezone} from "../../utils";

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
		const { page = 1, limit = 10, storeId, name, priceFrom, priceTo, day, from, to, timezone } = query;
		const qb = this.productRepository.createQueryBuilder('product')
			.leftJoinAndSelect('product.store', 'store');

		if (storeId) {
			qb.andWhere('product.storeId = :storeId', { storeId });
		}

		if (name) {
			qb.andWhere('LOWER(product.name) LIKE LOWER(:name)', { name: `%${name}%` });
		}

		if (priceFrom != null) {
			qb.andWhere('product.price >= :priceFrom', { priceFrom });
		}

		if (priceTo != null) {
			qb.andWhere('product.price <= :priceTo', { priceTo });
		}


		let fromInStoreTz = from;
		let toInStoreTz = to;

		if (timezone && day && (from && to)) {
			const store = await qb.getOne();
			const storeTimezone = store?.store?.timezone;

			if (storeTimezone) {
				fromInStoreTz = ConvertTimeByTimezone(from, timezone, storeTimezone);
				toInStoreTz   = ConvertTimeByTimezone(to, timezone, storeTimezone);
			}
		}

		if (day && from && to) {
			qb.andWhere(
				`product.availability -> :day ->> 'from' <= :from AND product.availability -> :day ->> 'to' >= :to`,
				{ day, from: fromInStoreTz, to: toInStoreTz },
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
				total,
			},
		};
	}

	async getActiveProducts(query: GetActiveProductsQueryDto): Promise<PaginationResponseDto<ProductEntity>> {
		const { storeId, timezone, time, page, limit } = query;
		const day = DateTime.now().setZone(timezone).toFormat('EEEE');

		const qb = this.productRepository
			.createQueryBuilder('product')
			.leftJoinAndSelect('product.store', 'store')

		if (storeId) {
			qb.andWhere('product.storeId = :storeId', { storeId });
		}

		const store = await qb.getOne();
		const storeTimezone = store?.store?.timezone;

		let timeInStore = time;

		if (timezone && storeTimezone) {
			timeInStore = ConvertTimeByTimezone(time, timezone, storeTimezone);
		}

		qb.andWhere(
			`product.availability -> :day ->> 'from' <= :time
     AND product.availability -> :day ->> 'to' >= :time`,
			{ day, time: timeInStore },
		);

		qb.skip((page - 1) * limit).take(limit);

		const [items, total] = await qb.getManyAndCount();

		return {
			items,
			meta: {
				page,
				pageSize: limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async findOne(id: number): Promise<ProductEntity> {
		const product = await this.productRepository
			.createQueryBuilder('product')
			.leftJoinAndSelect('product.store', 'store')
			.leftJoinAndSelect('store.admin', 'admin')
			.addSelect(['admin.id', 'admin.email'])
			.where('product.id = :id', { id })
			.getOne();

		if (!product) throw new NotFoundException('Product not found');
		return product;
	}

	async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
		await this.productRepository.update(id, dto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.productRepository.delete(id);
	}
}
