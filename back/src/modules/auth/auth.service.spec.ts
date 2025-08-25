import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { UserEntity } from '../../entities';
import { UserRoleEnum } from '../../common/enums';
import * as bcrypt from 'bcrypt';
import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

jest.mock('../../../src/common/constants/login.constants', () => ({
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let auditService: Partial<AuditService>;

  const mockUser = {
    id: 1,
    email: 'user@test.com',
    password: 'hashedPassword',
    role: UserRoleEnum.USER,
    stores: [],
    orders: [],
    failedLoginAttempts: 0,
    lockoutUntil: null,
    refreshToken: null,
    hashPassword: jest.fn(),
  } as unknown as UserEntity;

  beforeEach(async () => {
    usersService = {
      getByEmail: jest.fn(),
      create: jest.fn(),
      saveUser: jest.fn(),
      updateRefreshToken: jest.fn(),
      getById: jest.fn(),
      removeRefreshToken: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    auditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user if password matches', async () => {
      (usersService.getByEmail as jest.Mock).mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const user = await service.validateUser('user@test.com', 'password');
      expect(user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      (usersService.getByEmail as jest.Mock).mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(
        service.validateUser('user@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.saveUser).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if account is locked', async () => {
      (usersService.getByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        lockoutUntil: new Date(Date.now() + 10000),
      });

      await expect(
        service.validateUser('user@test.com', 'password'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.getByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        service.validateUser('unknown@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register new user and return tokens', async () => {
      (usersService.getByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        userPayload: {
          userId: 1,
          email: 'user@test.com',
          role: UserRoleEnum.USER,
          isHaveStores: false,
        },
      });

      const tokens = await service.register({
        email: 'user@test.com',
        password: 'password',
      } as any);
      expect(tokens.accessToken).toBe('access');
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user exists', async () => {
      (usersService.getByEmail as jest.Mock).mockResolvedValue(mockUser);
      await expect(
        service.register({
          email: 'user@test.com',
          password: 'password',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        userPayload: {
          userId: 1,
          email: 'user@test.com',
          role: UserRoleEnum.USER,
          isHaveStores: false,
        },
      });

      const tokens = await service.login({
        email: 'user@test.com',
        password: 'password',
      } as any);
      expect(tokens.accessToken).toBe('access');
      expect(auditService.log).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      (usersService.getById as jest.Mock).mockResolvedValue({
        ...mockUser,
        refreshToken: 'hashedRefresh',
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        userPayload: {
          userId: 1,
          email: 'user@test.com',
          role: UserRoleEnum.USER,
          isHaveStores: false,
        },
      });

      const tokens = await service.refreshToken(1, 'refresh');
      expect(tokens.accessToken).toBe('access');
    });

    it('should throw UnauthorizedException if token invalid', async () => {
      (usersService.getById as jest.Mock).mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.refreshToken(1, 'invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should remove refresh token and call audit log', async () => {
      await service.logout(1);
      expect(usersService.removeRefreshToken).toHaveBeenCalledWith(1);
      expect(auditService.log).toHaveBeenCalledWith(expect.anything(), 1);
    });
  });
});
