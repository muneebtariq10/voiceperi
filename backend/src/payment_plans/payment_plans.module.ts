/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlan } from 'src/entities/payment_plans';
import { PaymentPlanService } from './payment_plans.service';
import { PaymentPlanController } from './payment_plans.controller';
import { User } from 'src/entities/user';
import { BillingHistory } from 'src/entities/billing_history';
import { PaymentPlanPricing } from 'src/entities/payment_plans_pricing';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentPlan, User, BillingHistory,PaymentPlanPricing])],
  controllers: [PaymentPlanController],
  providers: [PaymentPlanService],
})
export class PaymentPlanModule {}
