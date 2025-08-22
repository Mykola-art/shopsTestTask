import { ExecutionContext } from '@nestjs/common';
import { OrderOwnerGuard } from './order.owner.guard';
import { UserRoleEnum } from '../common/enums';
import { ProductsService } from '../modules/products/products.service';
import { OrdersService } from '../modules/orders/orders.service';

describe('OrderOwnerGuard', () => {
  let guard: OrderOwnerGuard;
  let productsService: ProductsService;
  let ordersService: OrdersService;

  const mockUser = { id: 1, role: UserRoleEnum.USER } as any;

  const createMockExecutionContext = (user: any, params: any = {}) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        params,
      }),
    }),
  } as unknown as ExecutionContext);

  beforeEach(() => {
    productsService = { findOne: jest.fn() } as any;
    ordersService = { findOne: jest.fn() } as any;
    guard = new OrderOwnerGuard(productsService, ordersService);
  });

  it('should allow admin users', async () => {
    const context = createMockExecutionContext({ ...mockUser, role: UserRoleEnum.ADMIN });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should throw NotFoundException if orderId param missing', async () => {
    const context = createMockExecutionContext(mockUser, {});
    await expect(guard.canActivate(context)).rejects.toThrow('Order not found');
  });

  it('should throw NotFoundException if order not found', async () => {
    const context = createMockExecutionContext(mockUser, { id: '10' });

    // Return an object with undefined productId to avoid TypeError
    (ordersService.findOne as jest.Mock).mockResolvedValue({ productId: undefined, userId: 2 });

    await expect(guard.canActivate(context)).rejects.toThrow('Product not found');
  });

  it('should throw NotFoundException if product not found', async () => {
    const context = createMockExecutionContext(mockUser, { id: '10' });
    (ordersService.findOne as jest.Mock).mockResolvedValue({ productId: 99, userId: 2 });
    (productsService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow('Product not found');
  });

  it('should allow if user owns the order', async () => {
    const context = createMockExecutionContext(mockUser, { id: '10' });
    (ordersService.findOne as jest.Mock).mockResolvedValue({ productId: 1, userId: mockUser.id });
    (productsService.findOne as jest.Mock).mockResolvedValue({
      store: { admin: { id: 2 } },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should allow if user is store admin', async () => {
    const context = createMockExecutionContext(mockUser, { id: '10' });
    (ordersService.findOne as jest.Mock).mockResolvedValue({ productId: 1, userId: 2 });
    (productsService.findOne as jest.Mock).mockResolvedValue({
      store: { admin: { id: mockUser.id } },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should throw ForbiddenException if user is neither admin nor owner', async () => {
    const context = createMockExecutionContext(mockUser, { id: '10' });
    (ordersService.findOne as jest.Mock).mockResolvedValue({ productId: 1, userId: 2 });
    (productsService.findOne as jest.Mock).mockResolvedValue({
      store: { admin: { id: 99 } },
    });

    await expect(guard.canActivate(context)).rejects.toThrow('You are not allowed to modify this product');
  });
});
