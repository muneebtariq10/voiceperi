/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Agent } from './agent';
import { BusinessInformation } from './business_information';
import { BillingHistory } from './billing_history';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: false })
  firstname: string;

  @Column('varchar', { length: 100, nullable: true })
  lastname: string;

  @Column('varchar', { length: 200, unique: true })
  email: string;

  @Column('varchar', { length: 200 })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column('varchar', { length: 200, nullable: true })
  image: string;

  @Column({ type: 'smallint', default: 0 })
  status: number;

  @Column({ type: 'smallint', default: 0 })
  verified: number;

  @Column({ nullable: true })
  google_id: string;

  @Column({ nullable: true })
  event_id: string;

  @Column({ nullable: true })
  cal_key: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('varchar', { length: 100, nullable: true })
  deActivateTime: string;

  @OneToMany(() => Agent, (agent) => agent.user)
  agent: Agent[];

  @OneToMany(() => BusinessInformation, (info) => info.user_id)
  info: BusinessInformation[];

  @OneToMany(() => BillingHistory, (BillingHistory) => BillingHistory.user)
  BillingHistory: BillingHistory[]; // Relation to UserPayment
}
