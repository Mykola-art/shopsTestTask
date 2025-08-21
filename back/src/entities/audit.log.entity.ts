import { AuditEventType } from 'src/common/enums/audit.event.type.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLogEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'enum', enum: AuditEventType })
	eventType: AuditEventType;

	@Column({ nullable: true })
	userId?: number;

	@Column({ type: 'jsonb', nullable: true })
	metadata?: Record<string, any>; 

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}
