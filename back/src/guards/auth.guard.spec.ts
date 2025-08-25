import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../modules/users/users.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenPayloadDto } from '../common/dtos';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;
  let usersService: UsersService;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as unknown as JwtService;
    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    usersService = { getById: jest.fn() } as unknown as UsersService;

    guard = new AuthGuard(jwtService, configService, usersService);
  });

  function createMockExecutionContext(headers: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw if authorization header is missing', async () => {
    const context = createMockExecutionContext({});
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if token format is invalid', async () => {
    const context = createMockExecutionContext({
      authorization: 'InvalidToken',
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if jwt verification fails', async () => {
    const context = createMockExecutionContext({
      authorization: 'Bearer badtoken',
    });
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user and return true for valid token', async () => {
    const context = createMockExecutionContext({
      authorization: 'Bearer goodtoken',
    });
    const payload: TokenPayloadDto = { id: 1 };
    const mockUser = { id: 1, email: 'user@test.com' };

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);
    (usersService.getById as jest.Mock).mockResolvedValue(mockUser);

    const result = await guard.canActivate(context as any);
    expect(result).toBe(true);
  });
});
