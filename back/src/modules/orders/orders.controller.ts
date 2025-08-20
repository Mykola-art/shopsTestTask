import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Param,
	Body,
	UseGuards,
	Query,
} from '@nestjs/common';
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
	CreateOrderDto,
	UpdateOrderDto,
	FindOrdersQueryDto,
} from './dtos';
import { OrderEntity, UserEntity } from '../../entities';
import { PaginationResponseDto } from '../../common/dtos';
import { GetUser } from '../../decorators';
import {AdminGuard, AuthGuard, OrderOwnerGuard} from '../../guards';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@ApiOperation({ summary: 'Create new order' })
	@ApiResponse({ status: 201, type: OrderEntity })
	create(@Body() dto: CreateOrderDto, @GetUser() user: UserEntity):Promise<OrderEntity> {
		return this.ordersService.create({ ...dto, userId: user.id });
	}

	@Get()
	@UseGuards(AdminGuard)
	@ApiOperation({ summary: 'Get all orders (pagination + filters)' })
	@ApiResponse({ status: 200, type: PaginationResponseDto<OrderEntity> })
	@ApiQuery({ type: FindOrdersQueryDto })
	findAll(@Query() query: FindOrdersQueryDto):Promise<PaginationResponseDto<OrderEntity>> {
		return this.ordersService.findAll(query);
	}

	@Get('my')
	@ApiOperation({ summary: 'Get orders of current user' })
	@ApiResponse({ status: 200, type: PaginationResponseDto<OrderEntity> })
	@ApiQuery({ type: FindOrdersQueryDto })
	getMyOrders(@GetUser() user: UserEntity, @Query() query: FindOrdersQueryDto):Promise<PaginationResponseDto<OrderEntity>> {
		return this.ordersService.getMyOrders(user.id, query);
	}

	@Get('store/:storeId')
	@ApiOperation({ summary: 'Get orders for a specific store' })
	@ApiResponse({ status: 200, type: PaginationResponseDto<OrderEntity> })
	@ApiQuery({ type: FindOrdersQueryDto })
	getStoreOrders(
		@Param('storeId') storeId: number,
		@Query() query: FindOrdersQueryDto,
	):Promise<PaginationResponseDto<OrderEntity>> {
		return this.ordersService.getStoreOrders(storeId, query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get order by Id' })
	@ApiResponse({ status: 200, type: OrderEntity })
	findOne(@Param('id') id: number):Promise<OrderEntity> {
		return this.ordersService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(OrderOwnerGuard)
	@ApiOperation({ summary: 'Update order' })
	@ApiResponse({ status: 200, type: OrderEntity })
	update(@Param('id') id: number, @Body() dto: UpdateOrderDto):Promise<OrderEntity> {
		return this.ordersService.update(id, dto);
	}

	@Delete(':id')
	@UseGuards(OrderOwnerGuard)
	@ApiOperation({ summary: 'Delete order' })
	@ApiResponse({ status: 200, description: 'Order deleted' })
	remove(@Param('id') id: number):Promise<void> {
		return this.ordersService.remove(id);
	}
}
