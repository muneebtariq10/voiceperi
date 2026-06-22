/* eslint-disable prettier/prettier */
// billing-history.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingHistory } from 'src/entities/billing_history';
import { BillingHistoryService } from './billing_history.service';
import { BillingHistoryController } from './billing_history.controller';


@Module({
  imports: [TypeOrmModule.forFeature([BillingHistory])],
  providers: [BillingHistoryService],
  controllers: [BillingHistoryController],
  exports: [BillingHistoryService],
})
export class BillingHistoryModule {}
