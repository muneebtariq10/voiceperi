/* eslint-disable prettier/prettier */
// billing-history.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { BillingHistoryService } from './billing_history.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('billing-history')
export class BillingHistoryController {
  constructor(private readonly billingService: BillingHistoryService) {}
  @Public()
  @Get(':userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.billingService.getByUserId(userId);
  }
}
