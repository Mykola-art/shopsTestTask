import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {CreateProductDto, UpdateProductDto, FindProductsQueryDto, GetActiveProductsQueryDto} from './dtos';
import { ProductEntity, UserEntity } from '../../entities';
import {AuthGuard, StoreOwnerGuard} from '../../guards';
import { PaginationResponseDto } from '../../common/dtos';
import { GetUser } from '../../../src/decorators';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@ApiHeader({
	name: 'X-CSRF-Token',
	description: 'CSRF token received from GET /auth/csrf-token',
	required: true,
})
@UseGuards(AuthGuard)
@Controller({path: 'products', version: '1'})
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	@UseGuards(StoreOwnerGuard)
	@ApiOperation({ summary: 'Create a new product' })
	@ApiResponse({ status: 201, description: 'Product successfully created', type: ProductEntity })
	create(@Body() dto: CreateProductDto, @GetUser() user: UserEntity): Promise<ProductEntity> {
		return this.productsService.create(dto, user.id);
	}

	@Get()
	@ApiOperation({ summary: 'Get all products with pagination and filters' })
	@ApiResponse({
		status: 200,
		description: 'Products successfully returned',
		type: PaginationResponseDto<ProductEntity>,
	})
	@ApiQuery({ type: FindProductsQueryDto })
	findAll(@Query() query: FindProductsQueryDto): Promise<PaginationResponseDto<ProductEntity>> {
		return this.productsService.findAll(query);
	}

	@Get('active')
	@ApiOperation({ summary: 'Get active products for a store at a specific time' })
	@ApiResponse({
		status: 200,
		description: 'Returns paginated list of active products',
		type: PaginationResponseDto<ProductEntity>,
	})
	async getActiveProducts(
		@Query() query: GetActiveProductsQueryDto,
	): Promise<PaginationResponseDto<ProductEntity>> {
		return this.productsService.getActiveProducts(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get product by ID' })
	@ApiResponse({ status: 200, type: ProductEntity })
	findOne(@Param('id') id: number): Promise<ProductEntity> {
		return this.productsService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(StoreOwnerGuard)
	@ApiOperation({ summary: 'Update product' })
	@ApiResponse({ status: 200, type: ProductEntity })
	update(@Param('id') id: number, @Body() dto: UpdateProductDto, @GetUser() user: UserEntity): Promise<ProductEntity> {
		return this.productsService.update(id, dto, user.id)
	}

	@Delete(':id')
	@UseGuards(StoreOwnerGuard)
	@ApiOperation({ summary: 'Delete product' })
	@ApiResponse({ status: 200, description: 'Product deleted' })
	remove(@Param('id') id: number, @GetUser() user: UserEntity): Promise<void> {
		return this.productsService.remove(id, user.id);
	}
}
