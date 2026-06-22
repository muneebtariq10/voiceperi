import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';


@Entity('business_informations')
export class BusinessInformation {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    profile: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    address: string;

    @Column({ type: 'varchar' })
    phone: string;

    @Column({ type: 'text', nullable: true })
    overview?: string;

    @Column({ type: 'jsonb', nullable: true })
    services?: string[];

    @Column({ type: 'jsonb', nullable: true })
    business_hours?: string[];

    @Column({ type: 'varchar' })
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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}