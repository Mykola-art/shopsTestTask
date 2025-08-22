import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLogEntity } from '../../entities';
import { AuditEventType } from '../../common/enums/audit.event.type.enum';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: Repository<AuditLogEntity>;

  const mockLog: AuditLogEntity = {
    id: 1,
    eventType: AuditEventType.CREATE_STORE,
    userId: 1,
    metadata: { some: 'data' },
    createdAt: new Date(),
  } as unknown as AuditLogEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLogEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditRepo = module.get<Repository<AuditLogEntity>>(getRepositoryToken(AuditLogEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create and save an audit log', async () => {
      jest.spyOn(auditRepo, 'create').mockReturnValue(mockLog);
      jest.spyOn(auditRepo, 'save').mockResolvedValue(mockLog);

      await service.log(AuditEventType.CREATE_STORE, 1, { extra: 'info' });

      expect(auditRepo.create).toHaveBeenCalledWith({
        eventType: AuditEventType.CREATE_STORE,
        userId: 1,
        metadata: { extra: 'info' },
      });
      expect(auditRepo.save).toHaveBeenCalledWith(mockLog);
    });

    it('should handle optional userId and metadata', async () => {
      jest.spyOn(auditRepo, 'create').mockReturnValue(mockLog);
      jest.spyOn(auditRepo, 'save').mockResolvedValue(mockLog);

      await service.log(AuditEventType.DELETE_PRODUCT);

      expect(auditRepo.create).toHaveBeenCalledWith({
        eventType: AuditEventType.DELETE_PRODUCT,
        userId: undefined,
        metadata: undefined,
      });
      expect(auditRepo.save).toHaveBeenCalledWith(mockLog);
    });
  });
});
