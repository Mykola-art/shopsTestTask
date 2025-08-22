import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { AuditService } from '../audit/audit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderEntity } from '../../entities';
import { CreateOrderDto, FindOrdersQueryDto, UpdateOrderDto } from './dtos';
import { Repository } from 'typeorm';
import { OrderTypeEnum } from '../../common/enums';
import { NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockRepository: jest.Mocked<Repository<OrderEntity>>;
  let auditService: AuditService;

  const mockOrder: OrderEntity = {
    id: 1,
    userId: 1,
    productId: 1,
    type: OrderTypeEnum.PICKUP,
    scheduleAt: new Date(),
    timezone: 'Europe/London',
    address: 'London, Example street 34',
    isAccepted: false,
    modifiers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null,
    product: null,
  } as any;

  const mockOrders = [mockOrder];

  const mockQueryBuilder: any = {
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([mockOrders, mockOrders.length]),
    getOne: jest.fn().mockResolvedValue(mockOrder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: {
            create: jest.fn().mockImplementation(dto => dto),
            save: jest.fn().mockResolvedValue(mockOrder),
            findOne: jest.fn().mockResolvedValue(mockOrder),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
            find: jest.fn().mockResolvedValue(mockOrders),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    mockRepository = module.get(getRepositoryToken(OrderEntity));
    auditService = module.get(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an order and log audit', async () => {
    const dto: CreateOrderDto = {
      userId: 1,
      productId: 1,
      type: OrderTypeEnum.PICKUP,
      scheduleAt: new Date(),
      timezone: 'Europe/London',
    };
    const result = await service.create(dto);
    expect(result).toEqual(mockOrder);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(dto);
    expect(auditService.log).toHaveBeenCalledWith('CREATE_ORDER', dto.userId);
  });

  it('should return paginated orders for findAll', async () => {
    const query: FindOrdersQueryDto = { page: 1, limit: 10 };
    const result = await service.findAll(query);
    expect(result.items).toEqual(mockOrders);
    expect(result.meta.total).toEqual(mockOrders.length);
  });

  it('should return orders for specific user', async () => {
    const query: FindOrdersQueryDto = { page: 1, limit: 10 };
    const result = await service.getMyOrders(1, query);
    expect(result.items).toEqual(mockOrders);
    expect(result.meta.total).toEqual(mockOrders.length);
  });

  it('should return orders for specific store', async () => {
    const query: FindOrdersQueryDto = { page: 1, limit: 10 };
    const result = await service.getStoreOrders(1, query);
    expect(result.items).toEqual(mockOrders);
    expect(result.meta.total).toEqual(mockOrders.length);
    expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('order.product', 'product');
  });

  it('should update an order and log audit', async () => {
    const dto: UpdateOrderDto = { address: 'New Address' };
    const result = await service.update(1, dto, 1);
    expect(result).toEqual(mockOrder);
    expect(mockRepository.update).toHaveBeenCalledWith(1, dto);
    expect(auditService.log).toHaveBeenCalledWith('UPDATE_ORDER', 1);
  });

  it('should throw NotFoundException when updating non-existing order', async () => {
    mockRepository.findOne.mockResolvedValueOnce(null);
    await expect(service.update(999, {}, 1)).rejects.toThrow(NotFoundException);
  });

  it('should remove an order and log audit', async () => {
    await service.remove(1, 1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(auditService.log).toHaveBeenCalledWith('DELETE_ORDER', 1);
  });

  it('should throw NotFoundException when removing non-existing order', async () => {
    mockRepository.findOne.mockResolvedValueOnce(null);
    await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
  });

  it('should return orders by store', async () => {
    const orders = await service.getOrdersByStore(1);
    expect(orders).toEqual(mockOrders);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { product: { store: { id: 1 } } },
    });
  });

  it('should handle empty results in getOrdersByStore', async () => {
    mockRepository.find.mockResolvedValueOnce([]);
    const orders = await service.getOrdersByStore(1);
    expect(orders).toEqual([]);
  });

  it('should handle getStoreOrders returning empty', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);
    const result = await service.getStoreOrders(1, { page: 1, limit: 10 });
    expect(result.items).toEqual([]);
    expect(result.meta.total).toEqual(0);
  });
});
