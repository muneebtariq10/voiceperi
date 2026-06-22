/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { UsageService } from './usedminutes.service';
import { Public } from 'src/auth/decorators/public.decorator';
// interface PlanUsageResult {
//     planId: number;
//     planTitle: string;
//     periodStart: Date;
//     periodEnd: Date;
//     allowedMinutes: number;
//     usedMinutes: number;
//     remainingMinutes: number;
//     reason?: string;
//   }
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  // @Public()
  // @Get(':userId')
  // async getUsage(@Param('userId') userId: string): Promise<PlanUsageResult[]> {
  //   return await this.usageService.getUsageByUser(userId);
  // }
  @Public()
@Get(':userId')
async getUsage(@Param('userId') userId: string): Promise<{
  allowedMinutes: number;
  usedMinutes: number;
  previousPlanUsedMinutes: number;
  previousPlanRemainingMinutes: number;
}> {
  return await this.usageService.getUsageByUser(userId);
}

}