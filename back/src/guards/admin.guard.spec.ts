import { AdminGuard } from './admin.guard';
import { UserRoleEnum } from '../common/enums';
import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  function createMockExecutionContext(user?: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if user is admin', () => {
    const context = createMockExecutionContext({ role: UserRoleEnum.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is not admin', () => {
    const context = createMockExecutionContext({ role: UserRoleEnum.USER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is undefined', () => {
    const context = createMockExecutionContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
