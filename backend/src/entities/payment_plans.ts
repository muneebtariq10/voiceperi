/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BillingHistory } from './billing_history';
import { PaymentPlanPricing } from './payment_plans_pricing';
@Entity('payment_plans')
export class PaymentPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  features: {
    minutes: number;
    price_per_minute: number | null;
    zapier_integration: boolean;
    smart_spam_detection: boolean;
    crm_integration: boolean;
    custom_agent_training: boolean;
    advance_call_transfer: boolean;
    appointment_links: boolean;
    advance_appointment_booking: boolean;
  };

  @Column({ nullable: true })
  stripe_product_id?: string;

  @Column({ default: false })
  is_popular: boolean;

  @OneToMany(() => BillingHistory, (BillingHistory) => BillingHistory.paymentPlan)
  BillingHistory: BillingHistory[];

  @OneToMany(() => PaymentPlanPricing, (pricing) => pricing.plan, { cascade: true })
  pricings: PaymentPlanPricing[];
}
