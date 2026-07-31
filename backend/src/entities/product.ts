import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  productId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  price: string;

  @Column({ type: 'varchar', nullable: true })
  sku: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  url: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  priceFrom: boolean;

  @Column({ type: 'int', nullable: true, default: 1 })
  minimumQuantity: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  descriptionTruncated: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
