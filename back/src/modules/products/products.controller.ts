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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, FindProductsQueryDto } from './dtos';
import { ProductEntity } from '../../entities';
import {AuthGuard, StoreOwnerGuard} from '../../guards';
import { PaginationResponseDto } from '../../common/dtos';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	@UseGuards(StoreOwnerGuard)
	@ApiOperation({ summary: 'Create a new product' })
	@ApiResponse({ status: 201, description: 'Product successfully created', type: ProductEntity })
	create(@Body() dto: CreateProductDto): Promise<ProductEntity> {
		return this.productsService.create(dto);
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
	update(@Param('id') id: number, @Body() dto: UpdateProductDto): Promise<ProductEntity> {
		return this.productsService.update(id, dto)
	}

	@Delete(':id')
	@UseGuards(StoreOwnerGuard)
	@ApiOperation({ summary: 'Delete product' })
	@ApiResponse({ status: 200, description: 'Product deleted' })
	remove(@Param('id') id: number): Promise<void> {
		return this.productsService.remove(id);
	}
}
