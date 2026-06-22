/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PaymentPlan } from "./payment_plans";
import { BillingHistory } from "./billing_history";
export enum PricingInterval {
  DAILY = 'day',
  WEEKLY = 'week',
  MONTHLY = 'month',
  YEARLY = 'year',
}



@Entity('payment_plan_pricings')
export class PaymentPlanPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PricingInterval })
  type: PricingInterval;

  @Column('decimal', { nullable: true })
  price: number;

  @Column()
  stripe_price_id: string;

  @Column({ type: 'enum', enum: ['percentage', 'value'], default: 'percentage',nullable:true })
  discount_type: 'percentage' | 'value';

  @Column('decimal', { nullable: true })
  discount: number | null;          

  @ManyToOne(() => PaymentPlan, (plan) => plan.pricings)
  @JoinColumn({ name: 'plan_id' })
  plan: PaymentPlan;

  @OneToMany(() => BillingHistory, (BillingHistory) => BillingHistory.PaymentPlanPricing)
  BillingHistory: BillingHistory[];

}
