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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import {
  CreateStoreDto,
  GetActiveStoresQueryDto,
  UpdateStoreDto,
} from './dtos';
import { StoreEntity, UserEntity } from '../../entities';
import { GetUser } from '../../decorators';
import { AuthGuard, StoreOwnerGuard } from '../../guards';
import {
  IdDto,
  PaginationResponseDto,
  ResponseStoreDashboardDto,
} from '../../common/dtos';
import { FindStoresQueryDto } from './dtos/find.stores.query.dto';

@ApiTags('Stores')
@ApiBearerAuth('access-token')
@ApiHeader({
  name: 'X-CSRF-Token',
  description: 'CSRF token received from GET /auth/csrf-token',
  required: true,
})
@UseGuards(AuthGuard)
@Controller({ path: 'stores', version: '1' })
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: 'Create new store' })
  @ApiResponse({
    status: 201,
    description: 'Store successfully created',
    type: StoreEntity,
  })
  create(
    @Body() dto: CreateStoreDto,
    @GetUser() user: UserEntity,
  ): Promise<StoreEntity> {
    return this.storesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores (pagination + filters)' })
  @ApiResponse({
    status: 200,
    description: 'Store successfully returned',
    type: PaginationResponseDto<StoreEntity>,
  })
  @ApiQuery({ type: FindStoresQueryDto })
  findAll(
    @Query() query: FindStoresQueryDto,
  ): Promise<PaginationResponseDto<StoreEntity>> {
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
    return this.storesService.getActiveStores(query);
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
  update(
    @Param('id') id: number,
    @Body() dto: UpdateStoreDto,
    @GetUser() user: UserEntity,
  ): Promise<StoreEntity> {
    return this.storesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(StoreOwnerGuard)
  @ApiOperation({ summary: 'Delete store' })
  @ApiResponse({ status: 200, description: 'Store deleted' })
  remove(@Param('id') id: number, @GetUser() user: UserEntity): Promise<void> {
    return this.storesService.remove(id, user.id);
  }

  @Get(':id/stats')
  @UseGuards(StoreOwnerGuard)
  @ApiOperation({ summary: 'Get statistics for a specific store' })
  @ApiResponse({
    status: 200,
    description:
      'Returns store statistics including product count and order stats',
    type: ResponseStoreDashboardDto,
  })
  async getStoreStats(
    @Param('id', ParseIntPipe) storeId: number,
  ): Promise<ResponseStoreDashboardDto> {
    return this.storesService.getStoreStats(storeId);
  }
}
