/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlanPricing } from 'src/entities/payment_plans_pricing';
import { PaymentPlanPricingController } from './payment_plan_pricing.controller';
import { PaymentPlanPricingService } from './payment_plan_pricing.service';


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([PaymentPlanPricing]),
  ],
  controllers: [PaymentPlanPricingController],
  providers: [PaymentPlanPricingService],
})
export class PaymentPlanPricingModule {}
