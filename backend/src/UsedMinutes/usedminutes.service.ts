/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingHistory } from 'src/entities/billing_history';
import { CallHistory } from 'src/entities/call_history';
import { Agent } from 'src/entities/agent';

// interface PlanUsageResult {
//   planId: number;
//   planTitle: string;
//   periodStart: Date;
//   periodEnd: Date;
//   allowedMinutes: number;
//   usedMinutes: number;
//   remainingMinutes: number;
//   reason?: string;
// }

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepo: Repository<Agent>,
    @InjectRepository(BillingHistory)
    private readonly billingRepo: Repository<BillingHistory>,
    @InjectRepository(CallHistory)
    private readonly callRepo: Repository<CallHistory>,
  ) {}

  // async getUsageByUser(userId: string): Promise<PlanUsageResult[]> {
  //   const agent = await this.agentRepo.findOne({
  //     where: { user: { id: userId } },
  //     relations: ['user'],
  //   });
  
  //   if (!agent || !agent.retell_agent) {
  //     throw new Error('Retell Agent not found for this user.');
  //   }
  
  //   const retellAgentId = agent.retell_agent;
  
  //   const billingHistories = await this.billingRepo.find({
  //     where: { user: { id: userId } },
  //     relations: ['paymentPlan'],
  //     order: { current_period_start: 'ASC' },
  //   });
  
  //   if (billingHistories.length === 0) {
  //     throw new Error('No billing history found for this user.');
  //   }
  
  //   const results: PlanUsageResult[] = [];
  
  //   const lastPlan = billingHistories[billingHistories.length - 1];
  
  //   if (billingHistories.length > 1) {
  //     const secondLast = billingHistories[billingHistories.length - 2];
  //     const secondLastEnd = new Date(secondLast.current_period_end);
  //     const lastStart = new Date(lastPlan.current_period_start);
  
  //     // Check overlap
  //     const isOverlapping = secondLastEnd > lastStart;
  
  //     if (isOverlapping) {
  //       // Previous plan usage (trimmed to avoid overlap)
  //       results.push(await this.calculateUsage(
  //         secondLast,
  //         new Date(secondLast.current_period_start),
  //         new Date(lastStart),
  //         retellAgentId,
  //         'Overlapping: previous plan trimmed to before current plan'
  //       ));
  
  //       // Current plan usage (full)
  //       results.push(await this.calculateUsage(
  //         lastPlan,
  //         new Date(lastPlan.current_period_start),
  //         new Date(lastPlan.current_period_end),
  //         retellAgentId,
  //         'Overlapping: current plan full usage'
  //       ));
  //     } else {
  //       // No overlap: return only latest plan
  //       results.push(await this.calculateUsage(
  //         lastPlan,
  //         new Date(lastPlan.current_period_start),
  //         new Date(lastPlan.current_period_end),
  //         retellAgentId,
  //         'Latest plan (no overlap)'
  //       ));
  //     }
  //   } else {
  //     // Only one plan
  //     results.push(await this.calculateUsage(
  //       lastPlan,
  //       new Date(lastPlan.current_period_start),
  //       new Date(lastPlan.current_period_end),
  //       retellAgentId,
  //       'Only one plan available'
  //     ));
  //   }
  
  //   return results;
  // }
  // private async calculateUsage(
  //   plan: BillingHistory,
  //   periodStart: Date,
  //   periodEnd: Date,
  //   retellAgentId: string,
  //   reason: string
  // ): Promise<PlanUsageResult> {
  //   const calls = await this.callRepo
  //     .createQueryBuilder('call')
  //     .where('call.retell_agent = :retellAgentId', { retellAgentId })
  //     .andWhere('call.start_timestamp >= :start AND call.start_timestamp < :end', {
  //       start: periodStart.getTime(),
  //       end: periodEnd.getTime(),
  //     })
  //     .getMany();
  
  //   const usedMinutes = calls.reduce((sum, call) => {
  //     const duration = call.end_timestamp - call.start_timestamp;
  //     return sum + duration / 60000;
  //   }, 0);
  
  //   const allowedMinutes = plan.paymentPlan.features.minutes;
  //   const remainingMinutes = Math.max(0, allowedMinutes - usedMinutes);
  
  //   return {
  //     planId: plan.id,
  //     planTitle: plan.paymentPlan.title,
  //     periodStart,
  //     periodEnd,
  //     allowedMinutes,
  //     usedMinutes: +usedMinutes.toFixed(2),
  //     remainingMinutes: +remainingMinutes.toFixed(2),
  //     reason,
  //   };
  // }
  async getUsageByUser(userId: string): Promise<{
    allowedMinutes: number,
    usedMinutes: number,
    previousPlanUsedMinutes: number,
    previousPlanRemainingMinutes: number
  }> {
    const agent = await this.agentRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  
    if (!agent || !agent.retell_agent) {
      throw new Error('Retell Agent not found for this user.');
    }
  
    const retellAgentId = agent.retell_agent;
  
    const billingHistories = await this.billingRepo.find({
      where: { user: { id: userId } },
      relations: ['paymentPlan'],
      order: { current_period_start: 'ASC' },
    });
  
    if (billingHistories.length === 0) {
      throw new Error('No billing history found for this user.');
    }
  
    const latestPlan = billingHistories[billingHistories.length - 1];
    const previousPlan = billingHistories.length > 1
      ? billingHistories[billingHistories.length - 2]
      : null;
  
    const currentStart = new Date(latestPlan.current_period_start);
    const currentEnd = new Date(latestPlan.current_period_end);
  
    const currentCalls = await this.callRepo
      .createQueryBuilder('call')
      .where('call.retell_agent = :retellAgentId', { retellAgentId })
      .andWhere('call.start_timestamp >= :start AND call.start_timestamp < :end', {
        start: currentStart.getTime(),
        end: currentEnd.getTime(),
      })
      .getMany();
  
    const currentUsed = currentCalls.reduce((sum, call) => {
      const duration = call.end_timestamp - call.start_timestamp;
      return sum + duration / 60000;
    }, 0);
  
    let previousUsed = 0;
    let previousRemaining = 0;
  
    if (previousPlan) {
      const previousStart = new Date(previousPlan.current_period_start);
      const previousEnd = new Date(previousPlan.current_period_end);
  
      const isOverlapping = previousEnd > currentStart;
  
      if (isOverlapping) {
        const prevCalls = await this.callRepo
          .createQueryBuilder('call')
          .where('call.retell_agent = :retellAgentId', { retellAgentId })
          .andWhere('call.start_timestamp >= :start AND call.start_timestamp < :end', {
            start: previousStart.getTime(),
            end: currentStart.getTime(),
          })
          .getMany();
  
        previousUsed = prevCalls.reduce((sum, call) => {
          const duration = call.end_timestamp - call.start_timestamp;
          return sum + duration / 60000;
        }, 0);
  
        const prevAllowed = previousPlan.paymentPlan.features.minutes;
        previousRemaining = Math.max(0, prevAllowed - previousUsed);
      }
    }
  
    return {
      allowedMinutes: latestPlan.paymentPlan.features.minutes,
      usedMinutes: +currentUsed.toFixed(2),
      previousPlanUsedMinutes: +previousUsed.toFixed(2),
      previousPlanRemainingMinutes: +previousRemaining.toFixed(2),
    };
  }
   
  
  
}
