import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity, StoreEntity } from '../../entities';
import { AuditService } from '../audit/audit.service';
import { NotFoundException } from '@nestjs/common';
import { AuditEventType } from '../../common/enums/audit.event.type.enum';
import { ConvertTimeByTimezone } from '../../utils';

jest.mock('../../utils', () => ({
  ConvertTimeByTimezone: jest.fn((time) => time),
}));

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: jest.Mocked<Repository<ProductEntity>>;
  let auditService: AuditService;

  const mockStore: StoreEntity = {
    id: 1,
    name: 'Test Store',
    slug: 'test-store',
    timezone: 'Europe/Kyiv',
    admin: { id: 1, email: 'admin@test.com' } as any,
    operatingHours: {},
    lat: 0,
    lng: 0,
    address: '',
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockProduct: ProductEntity = {
    id: 1,
    name: 'Pizza',
    price: 10,
    store: mockStore,
    storeId: mockStore.id,
    availability: { Monday: { from: '09:00', to: '18:00' } },
    description: '',
    cacheTTL: 3600,
    orders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockAudit = { log: jest.fn() };

  const mockQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(mockProduct),
    getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: AuditService, useValue: mockAudit },
        { provide: getRepositoryToken(ProductEntity), useClass: Repository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repo = module.get(getRepositoryToken(ProductEntity));
    auditService = module.get(AuditService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create product and log audit', async () => {
      jest.spyOn(repo, 'create').mockReturnValue(mockProduct);
      jest.spyOn(repo, 'save').mockResolvedValue(mockProduct);

      const result = await service.create({ name: 'Pizza', price: 10, storeId: 1, availability: {} } as any, 1);
      expect(result).toEqual(mockProduct);
      expect(auditService.log).toHaveBeenCalledWith(AuditEventType.CREATE_PRODUCT, 1);
    });
  });

  describe('findAll', () => {
    it('should return products with pagination', async () => {
      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.items).toEqual([mockProduct]);
      expect(result.meta.total).toBe(1);
    });

    it('should handle timezone conversion if provided', async () => {
      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
      await service.findAll({
        page: 1,
        limit: 10,
        day: 'Monday',
        from: '10:00',
        to: '12:00',
        timezone: 'Europe/Kyiv',
      } as any);
      expect(ConvertTimeByTimezone).toHaveBeenCalled();
    });
  });

  describe('getActiveProducts', () => {
    it('should return active products', async () => {
      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
      const result = await service.getActiveProducts({ storeId: 1, timezone: 'Europe/Kyiv', time: '10:00', page: 1, limit: 10 } as any);
      expect(result.items).toEqual([mockProduct]);
      expect(ConvertTimeByTimezone).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return product if found', async () => {
      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({ ...mockQueryBuilder, getOne: jest.fn().mockResolvedValue(undefined) });
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update product and log audit', async () => {
      jest.spyOn(repo, 'update').mockResolvedValue({} as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);
      const result = await service.update(1, { name: 'Updated' } as any, 1);
      expect(result).toEqual(mockProduct);
      expect(auditService.log).toHaveBeenCalledWith(AuditEventType.UPDATE_PRODUCT, 1);
    });
  });

  describe('remove', () => {
    it('should remove product and log audit', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({} as any);
      await service.remove(1, 1);
      expect(auditService.log).toHaveBeenCalledWith(AuditEventType.DELETE_PRODUCT, 1);
    });
  });

  describe('getCountByStore', () => {
    it('should return product count', async () => {
      jest.spyOn(repo, 'count').mockResolvedValue(3);
      const count = await service.getCountByStore(1);
      expect(count).toBe(3);
    });
  });
});
