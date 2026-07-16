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
  retell_agent: string | null; // added new column

  @Column('text', { nullable: true })
  llm_id: string | null; // added new column

  @Column('text', { nullable: true })
  message: string | null;

  @Column()
  voice_id: string;

  @Column('jsonb', { nullable: true })
  blocked_numbers: string[] | null;

  @Column('jsonb', { nullable: true })
  emails: string[] | null;

  @Column('text', { nullable: true })
  google_business_url: string | null;

  @Column('jsonb', { nullable: true })
  notes: string[] | null;

  @Column('jsonb', { nullable: true })
  phone_numbers: string[] | null;

  @Column('text', { nullable: true })
  ai_number: string | null;

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
