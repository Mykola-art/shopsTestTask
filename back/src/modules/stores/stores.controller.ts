import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dtos';
import { StoreEntity } from '../../entities';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('stores')
export class StoresController {
	constructor(private readonly storesService: StoresService) {}

	@Post()
	@ApiOperation({ summary: 'Create new store' })
	@ApiResponse({ status: 201, description: 'Store successfully created', type: StoreEntity })
	create(@Body() dto: CreateStoreDto): Promise<StoreEntity> {
		// adminId можна брати з @GetUser()
		return this.storesService.create(1, dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all stores' })
	@ApiResponse({ status: 200, type: [StoreEntity] })
	findAll(): Promise<StoreEntity[]> {
		return this.storesService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get store by Id' })
	@ApiResponse({ status: 200, type: StoreEntity })
	findOne(@Param('id') id: number): Promise<StoreEntity> {
		return this.storesService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update store' })
	@ApiResponse({ status: 200, type: StoreEntity })
	update(@Param('id') id: number, @Body() dto: UpdateStoreDto): Promise<StoreEntity> {
		return this.storesService.update(id, dto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete store' })
	@ApiResponse({ status: 200, description: 'Store deleted' })
	remove(@Param('id') id: number): Promise<void> {
		return this.storesService.remove(id);
	}
}
