import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {DateTime} from 'luxon';
import {StoreEntity} from '../../entities';
import {CreateStoreDto, GetActiveStoresQueryDto, UpdateStoreDto} from './dtos';
import {PaginationResponseDto} from "../../common/dtos";
import {FindStoresQueryDto} from "./dtos/find.stores.query.dto";
import {ConvertTimeByTimezone} from "../../utils";

@Injectable()
export class StoresService {
	constructor(
		@InjectRepository(StoreEntity)
		private readonly storeRepository: Repository<StoreEntity>,
	) {}

	async create(adminId: number, dto: CreateStoreDto): Promise<StoreEntity> {
		const store = this.storeRepository.create({
			...dto,
			admin: { id: adminId } as any,
		});
		return this.storeRepository.save(store);
	}

	async findAll(
		query: FindStoresQueryDto
	): Promise<PaginationResponseDto<StoreEntity>> {

		const {page, limit, timezone, name, address, day, from, to} = query
		const qb = this.storeRepository.createQueryBuilder('store');

		if (name) {
			qb.andWhere('LOWER(store.name) LIKE LOWER(:name)', { name: `%${name}%` });
		}

		if (address) {
			qb.andWhere('LOWER(store.address) LIKE LOWER(:address)', { address: `%${address}%` });
		}

		let fromInStoreTz = from;
		let toInStoreTz = to;

		if (timezone && day && (from && to)) {
			const store = await qb.getOne();
			const storeTimezone = store?.timezone;

			if (storeTimezone) {
				fromInStoreTz = ConvertTimeByTimezone(from, timezone, storeTimezone);
				toInStoreTz   = ConvertTimeByTimezone(to, timezone, storeTimezone);
			}
		}

		if (day && from && to) {
			qb.andWhere(
				`store.operatingHours -> :day ->> 'from' <= :from
       AND store.operatingHours -> :day ->> 'to'   >= :to`,
				{ day, from: fromInStoreTz, to: toInStoreTz },
			);
		}

		qb.skip((page - 1) * limit).take(limit);

		const [data, total] = await qb.getManyAndCount();
		return {
			items: data,
			meta: {
				totalPages: Math.ceil(total / limit),
				page,
				pageSize: limit,
				total
			}
		};
	}


	async findOne(id: number): Promise<StoreEntity> {
		const store = await this.storeRepository
			.createQueryBuilder('store')
			.leftJoinAndSelect('store.admin', 'admin')
			.addSelect(['admin.id', 'admin.email'])
			.where('store.id = :id', { id })
			.getOne();
		if (!store) throw new NotFoundException('Store not found');
		return store;
	}

	async getMyStores(userId: number):Promise<StoreEntity[]> {
		return this.storeRepository.find({
			where: { admin: { id: userId } },
		});
	}

	async getActiveStores(query: GetActiveStoresQueryDto): Promise<PaginationResponseDto<StoreEntity>> {
		const { timezone, time, page, limit } = query;
		const day = DateTime.now().setZone(timezone).toFormat('EEEE');

		const qb = this.storeRepository
			.createQueryBuilder('store')


		const store = await qb.getOne();
		const storeTimezone = store?.timezone;

		let timeInStore = time;

		if (timezone && storeTimezone) {
			timeInStore = ConvertTimeByTimezone(time, timezone, storeTimezone);
		}

		qb.andWhere(
			`store.operatingHours -> :day ->> 'from' <= :time
     AND store.operatingHours -> :day ->> 'to' >= :time`,
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

	async update(id: number, dto: UpdateStoreDto): Promise<StoreEntity> {
		const store = await this.findOne(id);
		const updated = Object.assign(store, dto);
		return this.storeRepository.save(updated);
	}

	async remove(id: number): Promise<void> {
		await this.findOne(id);
		await this.storeRepository.delete(id);
	}
}
