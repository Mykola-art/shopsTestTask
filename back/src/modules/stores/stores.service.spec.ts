import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoresService } from './stores.service';
import {
  StoreEntity,
  UserEntity,
  ProductEntity,
  OrderEntity,
  AuditLogEntity,
} from '../../entities';
import { AuditService } from '../audit/audit.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('../../utils', () => ({
  ConvertTimeByTimezone: jest.fn((time) => time),
}));

describe('StoresService', () => {
  let service: StoresService;
  let storeRepo: Repository<StoreEntity>;
  let auditService: AuditService;
  let productService: ProductsService;
  let orderService: OrdersService;

  const mockUser = { id: 1, email: 'user@test.com' } as UserEntity;
  const mockStore: StoreEntity = {
    id: 1,
    slug: 'test-store',
    name: 'Test Store',
    address: '123 Test St',
    timezone: 'Europe/Kyiv',
    lat: 50.45,
    lng: 30.52,
    operatingHours: { Monday: { from: '09:00', to: '18:00' } },
    admin: mockUser,
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    id: 1,
    name: 'Pizza',
    price: 10,
    store: mockStore,
    storeId: mockStore.id,
  } as ProductEntity;

  const mockOrder = {
    id: 1,
    userId: mockUser.id,
    productId: mockProduct.id,
    scheduleAt: new Date(),
    isAccepted: true,
    product: mockProduct,
  } as OrderEntity;

  const mockProductService = {
    getCountByStore: jest.fn().mockResolvedValue(1),
  };

  const mockOrderService = {
    getOrdersByStore: jest.fn().mockResolvedValue([mockOrder]),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        AuditService,
        ProductsService,
        OrdersService,
        { provide: getRepositoryToken(StoreEntity), useClass: Repository },
        { provide: getRepositoryToken(ProductEntity), useClass: Repository },
        { provide: getRepositoryToken(OrderEntity), useClass: Repository },
        { provide: getRepositoryToken(AuditLogEntity), useValue: {} },
      ],
    })
      .overrideProvider(AuditService)
      .useValue(mockAuditService)
      .overrideProvider(ProductsService)
      .useValue(mockProductService)
      .overrideProvider(OrdersService)
      .useValue(mockOrderService)
      .compile();

    service = module.get<StoresService>(StoresService);
    storeRepo = module.get<Repository<StoreEntity>>(
      getRepositoryToken(StoreEntity),
    );
    auditService = module.get<AuditService>(AuditService);
    productService = module.get<ProductsService>(ProductsService);
    orderService = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks(); // reset audit calls between tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a store and log audit', async () => {
      jest.spyOn(storeRepo, 'create').mockReturnValue(mockStore);
      jest.spyOn(storeRepo, 'save').mockResolvedValue(mockStore);

      const result = await service.create(mockUser.id, {
        slug: 'test-store',
        name: 'Test Store',
        address: '123 Test St',
        timezone: 'Europe/Kyiv',
        lat: 50.45,
        lng: 30.52,
      } as any);

      expect(result).toEqual(mockStore);
      expect(auditService.log).toHaveBeenCalledWith(
        'CREATE_STORE',
        mockUser.id,
      );
    });
  });

  describe('findOne', () => {
    it('should return store if found', async () => {
      jest.spyOn(storeRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockStore),
      } as any);

      const result = await service.findOne(1);
      expect(result).toEqual(mockStore);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(storeRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      } as any);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMyStores', () => {
    it('should return stores for user', async () => {
      jest.spyOn(storeRepo, 'find').mockResolvedValue([mockStore]);
      const result = await service.getMyStores(mockUser.id);
      expect(result).toEqual([mockStore]);
    });
  });

  describe('getStoreStats', () => {
    it('should return correct store stats', async () => {
      jest.spyOn(storeRepo, 'findOne').mockResolvedValue(mockStore);
      const result = await service.getStoreStats(mockStore.id);
      expect(result.storeId).toBe(mockStore.id);
      expect(result.productsCount).toBe(1);
      expect(result.ordersCount).toBe(1);
      expect(result.acceptedOrders).toBe(1);
    });

    it('should throw NotFoundException if store not found', async () => {
      jest.spyOn(storeRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getStoreStats(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update store and log audit', async () => {
      const updatedStore = {
        ...mockStore,
        name: 'Updated Name',
      } as StoreEntity;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockStore);
      jest.spyOn(storeRepo, 'save').mockResolvedValue(updatedStore);

      const result = await service.update(
        mockStore.id,
        { name: 'Updated Name' } as any,
        mockUser.id,
      );

      expect(result.name).toBe('Updated Name');
      expect(auditService.log).toHaveBeenCalledWith(
        'UPDATE_STORE',
        mockUser.id,
      );
    });

    it('should throw NotFoundException if store not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(
        service.update(999, { name: 'X' } as any, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete store and log audit', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockStore);
      jest.spyOn(storeRepo, 'delete').mockResolvedValue({} as any);

      await service.remove(mockStore.id, mockUser.id);
      expect(auditService.log).toHaveBeenCalledWith(
        'DELETE_STORE',
        mockUser.id,
      );
    });

    it('should throw NotFoundException if store not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.remove(999, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
