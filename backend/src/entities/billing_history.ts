/* eslint-disable prettier/prettier */
// src/payment_plans/entities/user-payments.entity.ts
import { PaymentPlan } from './payment_plans';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';
import { PaymentPlanPricing } from './payment_plans_pricing';

@Entity('billing_history')
export class BillingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.BillingHistory)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PaymentPlan, (paymentPlan) => paymentPlan.BillingHistory)
  @JoinColumn({ name: 'payment_plan_id' })
  paymentPlan: PaymentPlan;

  @ManyToOne(() => PaymentPlanPricing, (PaymentPlanPricing) => PaymentPlanPricing.BillingHistory)
  @JoinColumn({ name: 'payment_plan_price_id' })
  PaymentPlanPricing: PaymentPlanPricing;

  @Column({ nullable: true })
  stripe_subscription_id: string; // Stripe subscription ID

  // @Column()
  // stripe_payment_id:string;

  @Column({ nullable: true })
  stripe_customer_id: string; // Stripe customer ID

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
  
  @Column({ nullable: true })
  invoice_status: string; // Subscription status (e.g., active, canceled)

  @Column()
  subscription_status: string; 

  @Column({ nullable: true })
  invoice_url: string; 

  @Column()
  type: string; 

  @Column({ nullable: true })
  invoice_pdf_url: string;
  
  @Column({ type: 'timestamptz' })
  current_period_end: Date;
  
  @Column({ type: 'timestamptz' })
  current_period_start: Date;

  @Column({ nullable: true })
  canceled_at?: Date; // If the subscription is canceled, when

  @Column({ nullable: true })
  payment_method: string; // Payment method used (optional for tracking)
}
