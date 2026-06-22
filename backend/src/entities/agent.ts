/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Language } from './language';
import { User } from './user';

@Entity('agents')
export class Agent {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: false })
  agent_name: string;

  @ManyToOne(() => Language, (language) => language.agents, { nullable: false })
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @ManyToOne(() => User, (user) => user.agent, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text', { nullable: true })
  retell_agent: string; // added new column

  @Column('text', { nullable: true })
  llm_id: string; // added new column

  @Column('text', { nullable: true })
  message: string;

  @Column()
  voice_id: string;

  @Column('jsonb', { nullable: true })
  blocked_numbers: string[];

  @Column('jsonb', { nullable: true })
  emails: string[];

  @Column('text', { nullable: true })
  google_business_url: string;

  @Column('jsonb', { nullable: true })
  notes: string[];

  @Column('jsonb', { nullable: true })
  phone_numbers: string[];

  @Column({ type: 'boolean', default: false })
  hangup_if_call_detected: boolean;

  @Column({ type: 'boolean', default: false })
  block_800_number: boolean;

  @Column({ type: 'smallint', default: 0 })
  status: boolean;

  @Column('text', { nullable: true })
  audio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
