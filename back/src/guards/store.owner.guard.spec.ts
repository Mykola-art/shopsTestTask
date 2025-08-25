import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { StoreOwnerGuard } from './store.owner.guard';
import { StoresService } from '../modules/stores/stores.service';
import { UserRoleEnum } from '../common/enums';

describe('StoreOwnerGuard', () => {
  let guard: StoreOwnerGuard;
  let storesService: StoresService;

  const mockUser = { id: 1, role: UserRoleEnum.USER } as any;
  const mockStore = { id: 10, admin: { id: mockUser.id } };

  const createMockExecutionContext = (
    user: any,
    params: any = {},
    body: any = {},
  ) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params,
          body,
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    storesService = { findOne: jest.fn() } as any;
    guard = new StoreOwnerGuard(storesService);
  });

  it('should allow admin users', async () => {
    const context = createMockExecutionContext({
      ...mockUser,
      role: UserRoleEnum.ADMIN,
    });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should throw NotFoundException if store not found', async () => {
    const context = createMockExecutionContext(mockUser, { id: '10' });
    (storesService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not store admin', async () => {
    const context = createMockExecutionContext(mockUser, { id: '10' });
    (storesService.findOne as jest.Mock).mockResolvedValue({
      id: 10,
      admin: { id: 99 },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow store admin user', async () => {
    const context = createMockExecutionContext(mockUser, { id: '10' });
    (storesService.findOne as jest.Mock).mockResolvedValue(mockStore);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should get storeId from body if not in params', async () => {
    const context = createMockExecutionContext(mockUser, {}, { storeId: 10 });
    (storesService.findOne as jest.Mock).mockResolvedValue(mockStore);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(storesService.findOne).toHaveBeenCalledWith(10);
  });
});
