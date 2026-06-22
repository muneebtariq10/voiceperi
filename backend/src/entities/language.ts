import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Agent } from './agent';

@Entity('languages')
export class Language {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    code: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 50 })
    locale: string;

    @Column({ type: 'varchar', length: 3 })
    direction: 'ltr' | 'rtl';

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @OneToMany(() => Agent, (agent) => agent.language)
    agents: Agent[];
}