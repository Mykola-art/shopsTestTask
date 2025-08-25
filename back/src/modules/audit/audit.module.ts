import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLogEntity } from '../../entities';
@Module({
  providers: [AuditService],
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  exports: [AuditService],
})
export class AuditModule {}
