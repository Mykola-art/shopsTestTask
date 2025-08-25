import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  FindProductsQueryDto,
  GetActiveProductsQueryDto,
} from './dtos';
import { ProductEntity } from '../../entities';
import { PaginationResponseDto } from '../../common/dtos';
import { AuthGuard, StoreOwnerGuard } from '../../guards';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getActiveProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(StoreOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto: CreateProductDto = { name: 'Test', price: 100 } as any;
      const user = { id: 1 } as any;
      const result: ProductEntity = { id: 1, ...dto } as any;

      mockProductsService.create.mockResolvedValue(result);

      expect(await controller.create(dto, user)).toEqual(result);
      expect(mockProductsService.create).toHaveBeenCalledWith(dto, user.id);
    });
  });

  describe('findAll', () => {
    it('should return all products with pagination', async () => {
      const query: FindProductsQueryDto = { page: 1, limit: 10 };
      const result: PaginationResponseDto<ProductEntity> = {
        items: [],
        meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      };

      mockProductsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(query)).toEqual(result);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getActiveProducts', () => {
    it('should return active products', async () => {
      const query: GetActiveProductsQueryDto = {
        storeId: 1,
        timezone: 'UTC',
        time: new Date().toISOString(),
        page: 1,
        limit: 10,
      };
      const result: PaginationResponseDto<ProductEntity> = {
        items: [],
        meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      };

      mockProductsService.getActiveProducts.mockResolvedValue(result);

      expect(await controller.getActiveProducts(query)).toEqual(result);
      expect(mockProductsService.getActiveProducts).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return product by id', async () => {
      const productId = 1;
      const result: ProductEntity = { id: productId } as any;

      mockProductsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(productId)).toEqual(result);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe('update', () => {
    it('should update product', async () => {
      const productId = 1;
      const dto: UpdateProductDto = { name: 'Updated' } as any;
      const user = { id: 2 } as any;
      const result: ProductEntity = { id: productId, ...dto } as any;

      mockProductsService.update.mockResolvedValue(result);

      expect(await controller.update(productId, dto, user)).toEqual(result);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        productId,
        dto,
        user.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove product', async () => {
      const productId = 1;
      const user = { id: 2 } as any;

      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove(productId, user);
      expect(mockProductsService.remove).toHaveBeenCalledWith(
        productId,
        user.id,
      );
    });
  });
});
