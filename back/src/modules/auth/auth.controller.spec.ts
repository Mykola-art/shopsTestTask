import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserDto } from '../users/dtos';
import { TokenResponseDto } from '../../common/dtos';
import { AuthGuard } from '../../guards';
import { ExecutionContext } from '@nestjs/common';
import { UserRoleEnum } from '../../common/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return tokens', async () => {
      const dto: UserDto = { email: 'test@example.com', password: 'password' };
      const result: TokenResponseDto = {
        accessToken: 'access',
        refreshToken: 'refresh',
        userPayload: {
          userId: 1,
          email: dto.email,
          role: UserRoleEnum.USER,
          isHaveStores: false,
        },
      };

      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(dto)).toEqual(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const dto: UserDto = { email: 'test@example.com', password: 'password' };
      const result: TokenResponseDto = {
        accessToken: 'access',
        refreshToken: 'refresh',
        userPayload: {
          userId: 1,
          email: dto.email,
          role: UserRoleEnum.USER,
          isHaveStores: false,
        },
      };

      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(dto)).toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('should refresh token and return new tokens', async () => {
      const body = { userId: 1, refreshToken: 'refresh' };
      const result: TokenResponseDto = {
        accessToken: 'newAccess',
        refreshToken: 'newRefresh',
        userPayload: {
          userId: 1,
          email: 'test@example.com',
          role: UserRoleEnum.USER,
          isHaveStores: false,
        },
      };

      mockAuthService.refreshToken.mockResolvedValue(result);

      expect(await controller.refresh(body)).toEqual(result);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        body.userId,
        body.refreshToken,
      );
    });
  });

  describe('logout', () => {
    it('should call logout in service', async () => {
      const mockUser = { id: 1 };
      await controller.logout(mockUser as any);
      expect(mockAuthService.logout).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getCsrfToken', () => {
    it('should return csrf token', () => {
      const req = { csrfToken: () => 'csrf-token' };
      expect(controller.getCsrfToken(req)).toEqual({ csrfToken: 'csrf-token' });
    });
  });
});
