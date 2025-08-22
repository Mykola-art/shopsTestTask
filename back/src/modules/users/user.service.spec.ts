import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../entities';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserDto } from './dtos/user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<UserEntity>>;

  const mockUser: UserEntity = {
    id: 1,
    email: 'john@example.com',
    password: 'hashedPassword',
    role: 'USER',
    refreshToken: null,
    failedLoginAttempts: 0,
    lockoutUntil: null,
    stores: [],
    orders: [],
    hashPassword: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            create: jest.fn().mockImplementation((dto) => ({ ...dto })),
            save: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const dto: UserDto = { email: 'john@example.com', password: 'securePass123' };
      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('getById', () => {
    it('should return a user by id', async () => {
      (repository.findOneById as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.getById(1);
      expect(repository.findOneById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getByEmail', () => {
    it('should return a user by email', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.getByEmail('john@example.com');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'john@example.com' }, relations: ['stores'] });
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateRefreshToken', () => {
    it('should hash and update refresh token', async () => {
      const token = 'refreshToken123';
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedToken'));
      (repository.findOneById as jest.Mock).mockResolvedValue(mockUser);

      await service.updateRefreshToken(1, token);

      expect(bcrypt.hash).toHaveBeenCalledWith(token, 12);
      expect(repository.save).toHaveBeenCalledWith({ ...mockUser, refreshToken: 'hashedToken' });
    });

    it('should throw NotFoundException if user not found', async () => {
      (repository.findOneById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateRefreshToken(999, 'token')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateRefreshToken', () => {
    it('should return true if token is valid', async () => {
      const token = 'refreshToken123';
      (repository.findOneById as jest.Mock).mockResolvedValue({ ...mockUser, refreshToken: 'hashedToken' });
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateRefreshToken(1, token);
      expect(result).toBe(true);
    });

    it('should return false if user not found or no refreshToken', async () => {
      (repository.findOneById as jest.Mock).mockResolvedValue(null);
      const result = await service.validateRefreshToken(999, 'token');
      expect(result).toBe(false);
    });
  });

  describe('removeRefreshToken', () => {
    it('should set refreshToken to null', async () => {
      (repository.findOneById as jest.Mock).mockResolvedValue(mockUser);
      await service.removeRefreshToken(1);
      expect(repository.save).toHaveBeenCalledWith({ ...mockUser, refreshToken: null });
    });

    it('should throw NotFoundException if user not found', async () => {
      (repository.findOneById as jest.Mock).mockResolvedValue(null);
      await expect(service.removeRefreshToken(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveUser', () => {
    it('should save and return the user', async () => {
      const result = await service.saveUser(mockUser);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
