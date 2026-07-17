import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('order_lookup_audit')
export class OrderLookupAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  requestedOrderId: number;

  @Column({ type: 'varchar', nullable: true })
  verificationMethod: string;

  @Column({ type: 'boolean', default: false })
  verificationSucceeded: boolean;

  @Column({ type: 'varchar', nullable: true })
  source: string;

  @Column({ type: 'varchar', nullable: true })
  requestCorrelationId: string;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
