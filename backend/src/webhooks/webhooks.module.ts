/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeWebhookController } from './webhooks.controller';
import { BillingHistory } from 'src/entities/billing_history';
import { BillingHistoryService } from 'src/billing_history/billing_history.service';

@Module({
  imports: [TypeOrmModule.forFeature([BillingHistory])],
  controllers: [StripeWebhookController],
  providers: [BillingHistoryService],
})
export class StripeWebhookModule {}
