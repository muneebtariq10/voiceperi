import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user';

@Entity('business_informations')
export class BusinessInformation {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  profile: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  websiteUrl: string;

  @Column({ type: 'varchar', nullable: true })
  businessType: string;

  @Column({ type: 'varchar', nullable: true })
  dataSource: string;

  @Column({ type: 'varchar', nullable: true })
  placeId: string;

  @Column({ type: 'varchar', nullable: true })
  googleMapsUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', nullable: true })
  supportEmail: string;

  @Column({ type: 'varchar', nullable: true })
  contactPageUrl: string;

  @Column({ type: 'text', nullable: true })
  shippingInformation: string;

  @Column({ type: 'text', nullable: true })
  returnInformation: string;

  @Column({ type: 'text', nullable: true })
  faqs: string;

  @Column({ type: 'varchar', nullable: true })
  escalationPhone: string;

  @Column({ type: 'text', nullable: true })
  escalationInstructions: string;

  @Column({ type: 'varchar', nullable: true })
  agentGreeting: string;

  @Column({ type: 'varchar', nullable: true })
  agentTone: string;

  @Column({ type: 'text', nullable: true })
  overview?: string;

  @Column({ type: 'jsonb', nullable: true })
  services?: string[];

  @Column({ type: 'jsonb', nullable: true })
  business_hours?: string[];

  @Column({ type: 'varchar', nullable: true })
  timezone: string;

  // @ManyToOne(() => User, (user) => user.info, { nullable: false })
  // @JoinColumn({ name: 'user_id' })
  // user_id: User;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  // @Column({ type: 'jsonb' })
  // business_hours: {
  //     monday: { from: string; to: string; enabled: boolean };
  //     tuesday: { from: string; to: string; enabled: boolean };
  //     wednesday: { from: string; to: string; enabled: boolean };
  //     thursday: { from: string; to: string; enabled: boolean };
  //     friday: { from: string; to: string; enabled: boolean };
  //     saturday: { from: string; to: string; enabled: boolean };
  //     sunday: { from: string; to: string; enabled: boolean };
  // };

  @Column({ type: 'varchar', nullable: true })
  shopifyStoreUrl: string;

  @Column({ type: 'varchar', nullable: true })
  shopifyAccessToken: string;

  @Column({ type: 'varchar', nullable: true })
  shopifyClientId: string;

  @Column({ type: 'varchar', nullable: true })
  shopifyClientSecret: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
