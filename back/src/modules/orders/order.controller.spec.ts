import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, FindOrdersQueryDto } from './dtos';
import { OrderEntity } from '../../entities';
import { PaginationResponseDto } from '../../common/dtos';
import { AuthGuard, AdminGuard, OrderOwnerGuard } from '../../guards';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getMyOrders: jest.fn(),
    getStoreOrders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OrderOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const dto: CreateOrderDto = {
        type: 'delivery',
        address: 'Test Address',
        scheduleAt: new Date(),
      } as any;
      const user = { id: 1 } as any;
      const result: OrderEntity = { id: 1, ...dto, userId: 1 } as any;

      mockOrdersService.create.mockResolvedValue(result);

      expect(await controller.create(dto, user)).toEqual(result);
      expect(mockOrdersService.create).toHaveBeenCalledWith({
        ...dto,
        userId: user.id,
      });
    });
  });

  describe('findAll', () => {
    it('should return all orders with pagination', async () => {
      const query: FindOrdersQueryDto = { page: 1, limit: 10 };
      const result: PaginationResponseDto<OrderEntity> = {
        items: [],
        meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      };

      mockOrdersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(query)).toEqual(result);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      const orderId = 1;
      const result: OrderEntity = { id: orderId } as any;

      mockOrdersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(orderId)).toEqual(result);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(orderId);
    });
  });

  describe('update', () => {
    it('should update order', async () => {
      const orderId = 1;
      const dto: UpdateOrderDto = { address: 'Updated Address' } as any;
      const user = { id: 2 } as any;
      const result: OrderEntity = { id: orderId, ...dto } as any;

      mockOrdersService.update.mockResolvedValue(result);

      expect(await controller.update(orderId, dto, user)).toEqual(result);
      expect(mockOrdersService.update).toHaveBeenCalledWith(
        orderId,
        dto,
        user.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove order', async () => {
      const orderId = 1;
      const user = { id: 2 } as any;

      mockOrdersService.remove.mockResolvedValue(undefined);

      await controller.remove(orderId, user);
      expect(mockOrdersService.remove).toHaveBeenCalledWith(orderId, user.id);
    });
  });

  describe('getMyOrders', () => {
    it('should return user orders', async () => {
      const query: FindOrdersQueryDto = { page: 1, limit: 10 };
      const user = { id: 1 } as any;
      const result: PaginationResponseDto<OrderEntity> = {
        items: [],
        meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      };

      mockOrdersService.getMyOrders.mockResolvedValue(result);

      expect(await controller.getMyOrders(user, query)).toEqual(result);
      expect(mockOrdersService.getMyOrders).toHaveBeenCalledWith(
        user.id,
        query,
      );
    });
  });

  describe('getStoreOrders', () => {
    it('should return store orders', async () => {
      const query: FindOrdersQueryDto = { page: 1, limit: 10 };
      const storeId = 5;
      const result: PaginationResponseDto<OrderEntity> = {
        items: [],
        meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      };

      mockOrdersService.getStoreOrders.mockResolvedValue(result);

      expect(await controller.getStoreOrders(storeId, query)).toEqual(result);
      expect(mockOrdersService.getStoreOrders).toHaveBeenCalledWith(
        storeId,
        query,
      );
    });
  });
});
