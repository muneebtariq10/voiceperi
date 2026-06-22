import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('logs_call_history')
export class Log {
  @PrimaryColumn({ type: 'uuid' })
  log_id: string;

  @Column({ type: 'bigint' }) 
  start_timestamp: number;

  @Column({ type: 'bigint' }) 
  end_timestamp: number;

  @Column()
  records_loaded: number;

  @Column()
  status: string;

  @Column()
  error_message: string;


  @CreateDateColumn()
  createdAt: Date;
}
