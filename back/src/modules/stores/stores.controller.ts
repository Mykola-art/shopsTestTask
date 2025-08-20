import {Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import {CreateStoreDto, GetActiveStoresQueryDto, UpdateStoreDto} from './dtos';
import {StoreEntity, UserEntity} from '../../entities';
import {GetUser} from "../../decorators";
import {AuthGuard, StoreOwnerGuard} from "../../guards";
import {PaginationResponseDto} from "../../common/dtos";
import {FindStoresQueryDto} from "./dtos/find.stores.query.dto";

@ApiTags('Stores')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('stores')
export class StoresController {
	constructor(private readonly storesService: StoresService) {}

	@Post()
	@ApiOperation({ summary: 'Create new store' })
	@ApiResponse({ status: 201, description: 'Store successfully created', type: StoreEntity })
	create(@Body() dto: CreateStoreDto, @GetUser() user: UserEntity): Promise<StoreEntity> {
		return this.storesService.create(user.id, dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all stores (pagination + filters)' })
	@ApiResponse({ status: 200, description: 'Store successfully returned', type: PaginationResponseDto<StoreEntity> })
	@ApiQuery({ type: FindStoresQueryDto })
	findAll(
		@Query() query: FindStoresQueryDto
	):Promise<PaginationResponseDto<StoreEntity>> {
		return this.storesService.findAll(query);
	}

	@Get('my')
	@ApiOperation({ summary: 'Get stores of current user (admin)' })
	@ApiResponse({
		status: 200,
		description: 'Returns the list of stores owned by the current user',
		type: [StoreEntity],
	})
	getMyStores(@GetUser() user: UserEntity): Promise<StoreEntity[]> {
		return this.storesService.getMyStores(user.id);
	}

	@Get('active')
	@ApiOperation({ summary: 'Get active stores for a store at a specific time' })
	@ApiResponse({
		status: 200,
		description: 'Returns paginated list of active stores',
		type: PaginationResponseDto<StoreEntity>,
	})
	async getActiveStores(
		@Query() query: GetActiveStoresQueryDto,
	): Promise<PaginationResponseDto<StoreEntity>> {
		return this.storesService.getActiveStores(query)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get store by Id' })
	@ApiResponse({ status: 200, type: StoreEntity })
	findOne(@Param('id') id: number): Promise<StoreEntity> {
		return this.storesService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(StoreOwnerGuard)
	@ApiOperation({ summary: 'Update store' })
	@ApiResponse({ status: 200, type: StoreEntity })
	update(@Param('id') id: number, @Body() dto: UpdateStoreDto): Promise<StoreEntity> {
		return this.storesService.update(id, dto);
	}

	@Delete(':id')
	@UseGuards(StoreOwnerGuard)
	@ApiOperation({ summary: 'Delete store' })
	@ApiResponse({ status: 200, description: 'Store deleted' })
	remove(@Param('id') id: number): Promise<void> {
		return this.storesService.remove(id);
	}
}
