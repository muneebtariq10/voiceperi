import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('call_history')
export class CallHistory {
  @PrimaryColumn('uuid')
  id: string;

  @Column('bigint')
  start_timestamp: number;

  @Column('bigint')
  end_timestamp: number;

  @Column('text')
  call_status: string;

  @Column('text')
  disconnection_reason: string;

  @Column({ type: 'json', nullable: true })
  transcript_object: any;

  @Column({ type: 'text', nullable: true })
  recording_url: string;

  @Column('jsonb')
  call_analysis: {
    call_summary: string;
    user_sentiment: string;
    call_successful: boolean;
  };

  @Column({ nullable: true })
  retell_agent: string;

  @Column('jsonb')
  latency: {
    e2e: { p50: number; [key: string]: any };
    [key: string]: any;
  };

  @Column('jsonb')
  call_cost: {
    combined_cost: number;
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  from_number: string;

  @Column({ type: 'text', nullable: true })
  to_number: string;

  @Column({ type: 'text', nullable: true })
  direction: string;

  @Column({ type: 'text', nullable: true })
  call_type: string;
}
