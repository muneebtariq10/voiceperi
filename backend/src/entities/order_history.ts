import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order';

@Entity('order_history')
export class OrderHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'int', nullable: true })
  statusId: number;

  @Column({ type: 'varchar', nullable: true })
  statusName: string;

  @Column({ type: 'text', nullable: true })
  sanitizedComment: string;

  @Column({ type: 'timestamp', nullable: true })
  dateAdded: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
