import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderProduct } from './order_product';
import { OrderHistory } from './order_history';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  externalOrderId: number;

  @Column({ type: 'int', nullable: true })
  externalCustomerId: number;

  @Column({ type: 'varchar', nullable: true })
  orderType: string;

  @Column({ type: 'int', nullable: true })
  statusId: number;

  @Column({ type: 'varchar', nullable: true })
  statusName: string;

  @Column({ type: 'varchar', nullable: true })
  customerFriendlyStatus: string;

  @Column({ type: 'varchar', nullable: true })
  currencyCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shippingTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grandTotal: number;

  @Column({ type: 'varchar', nullable: true })
  shippingMethod: string;

  @Column({ type: 'varchar', nullable: true })
  paymentMethod: string;

  @Column({ type: 'timestamp', nullable: true })
  dateAdded: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateModified: Date;

  @Column({ type: 'int', nullable: true })
  reorderId: number;

  @Column({ type: 'int', nullable: true })
  vendorId: number;

  @Column({ type: 'int', nullable: true })
  representativeId: number;

  @Column({ type: 'varchar', nullable: true })
  customerEmailNormalized: string;

  @Column({ type: 'varchar', nullable: true })
  customerPhoneLast4: string;

  @Column({ type: 'varchar', nullable: true })
  shippingPostcodeNormalized: string;

  @OneToMany(() => OrderProduct, (product) => product.order)
  products: OrderProduct[];

  @OneToMany(() => OrderHistory, (history) => history.order)
  history: OrderHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
