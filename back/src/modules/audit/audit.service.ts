import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditEventType } from '../../common/enums/audit.event.type.enum';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../../entities';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepository: Repository<AuditLogEntity>,
  ) {}

  async log(
    eventType: AuditEventType,
    userId?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const log = this.auditRepository.create({ eventType, userId, metadata });
    await this.auditRepository.save(log);
  }
}
