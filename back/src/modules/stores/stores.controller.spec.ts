import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { StoreEntity, UserEntity } from '../../entities';
import { CreateStoreDto, UpdateStoreDto, GetActiveStoresQueryDto } from './dtos';
import { PaginationResponseDto, ResponseStoreDashboardDto } from '../../common/dtos';
import { AuthGuard, StoreOwnerGuard } from '../../guards';
import { CanActivate } from '@nestjs/common';

describe('StoresController', () => {
  let controller: StoresController;
  let mockStoresService: Record<keyof StoresService, jest.Mock>;

  beforeEach(async () => {
    mockStoresService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      getMyStores: jest.fn(),
      getActiveStores: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getStoreStats: jest.fn(),
    } as unknown as Record<keyof StoresService, jest.Mock>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        { provide: StoresService, useValue: mockStoresService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) } as CanActivate)
      .overrideGuard(StoreOwnerGuard)
      .useValue({ canActivate: jest.fn(() => true) } as CanActivate)
      .compile();

    controller = module.get<StoresController>(StoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a store', async () => {
    const user = { id: 1 } as UserEntity;
    const dto: CreateStoreDto = {
      name: 'Test Store',
      slug: 'test-store',
      address: '123 Test St',
      timezone: 'UTC',
      lat: 0,
      lng: 0,
    };
    const store: StoreEntity = { id: 1, ...dto, admin: user } as StoreEntity;

    mockStoresService.create.mockResolvedValue(store);

    expect(await controller.create(dto, user)).toEqual(store);
    expect(mockStoresService.create).toHaveBeenCalledWith(user.id, dto);
  });

  it('should return all stores', async () => {
    const query = { page: 1, limit: 10 } as any;
    const result: PaginationResponseDto<StoreEntity> = {
      items: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    };

    mockStoresService.findAll.mockResolvedValue(result);

    expect(await controller.findAll(query)).toEqual(result);
    expect(mockStoresService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return my stores', async () => {
    const user = { id: 1 } as UserEntity;
    const stores: StoreEntity[] = [];

    mockStoresService.getMyStores.mockResolvedValue(stores);

    expect(await controller.getMyStores(user)).toEqual(stores);
    expect(mockStoresService.getMyStores).toHaveBeenCalledWith(user.id);
  });

  it('should return active stores', async () => {
    const query: GetActiveStoresQueryDto = { timezone: 'UTC', time: '12:00', page: 1, limit: 10 };
    const result: PaginationResponseDto<StoreEntity> = {
      items: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    };

    mockStoresService.getActiveStores.mockResolvedValue(result);

    expect(await controller.getActiveStores(query)).toEqual(result);
    expect(mockStoresService.getActiveStores).toHaveBeenCalledWith(query);
  });

  it('should return store by id', async () => {
    const store: StoreEntity = { id: 1, name: 'Test', address: '123' } as StoreEntity;
    mockStoresService.findOne.mockResolvedValue(store);

    expect(await controller.findOne(1)).toEqual(store);
    expect(mockStoresService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update store', async () => {
    const user = { id: 1 } as UserEntity;
    const dto: UpdateStoreDto = {
      name: 'Updated',
      slug: 'updated-store',
      address: '123 Test St',
      timezone: 'UTC',
      lat: 0,
      lng: 0,
    };
    const store: StoreEntity = { id: 1, ...dto } as StoreEntity;

    mockStoresService.update.mockResolvedValue(store);

    expect(await controller.update(1, dto, user)).toEqual(store);
    expect(mockStoresService.update).toHaveBeenCalledWith(1, dto, user.id);
  });

  it('should remove store', async () => {
    const user = { id: 1 } as UserEntity;

    mockStoresService.remove.mockResolvedValue(undefined);

    expect(await controller.remove(1, user)).toBeUndefined();
    expect(mockStoresService.remove).toHaveBeenCalledWith(1, user.id);
  });

  it('should return store stats', async () => {
    const stats: ResponseStoreDashboardDto = {
      storeId: 1,
      productsCount: 5,
      ordersCount: 10,
      acceptedOrders: 3,
      pendingOrders: 7,
      pastOrders: 6,
      upcomingOrders: 4,
    };

    mockStoresService.getStoreStats.mockResolvedValue(stats);

    expect(await controller.getStoreStats(1)).toEqual(stats);
    expect(mockStoresService.getStoreStats).toHaveBeenCalledWith(1);
  });
});
