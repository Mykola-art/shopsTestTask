import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from '../../entities';
import { CreateStoreDto, UpdateStoreDto } from './dtos';

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

	async findAll(): Promise<StoreEntity[]> {
		return this.storeRepository.find();
	}

	async findOne(id: number): Promise<StoreEntity> {
		const store = await this.storeRepository.findOne({ where: { id } });
		if (!store) throw new NotFoundException('Store not found');
		return store;
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
