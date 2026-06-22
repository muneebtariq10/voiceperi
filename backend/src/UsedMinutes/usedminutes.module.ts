/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingHistory } from 'src/entities/billing_history';
import { CallHistory } from 'src/entities/call_history';
import { UsageService } from './usedminutes.service';
import { UsageController } from './usedminutes.controller';
import { Agent } from 'src/entities/agent';

@Module({
  imports: [TypeOrmModule.forFeature([BillingHistory, CallHistory, Agent])],
  providers: [UsageService,],
  controllers: [UsageController],
})
export class UsageModule {}
