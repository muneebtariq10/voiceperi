import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { map, firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { CallHistory } from 'src/entities/call_history';
import { LogService } from '../logs_call_history/logs.service';
import { BusinessInformation } from 'src/entities/business_information';
import { NotFoundException } from '@nestjs/common';
import { Agent } from 'src/entities/agent';
@Injectable()
export class CallHistoryService {
  constructor(
    @InjectRepository(BusinessInformation)
    private readonly businessRepo: Repository<BusinessInformation>,
    private readonly httpService: HttpService,
    @InjectRepository(CallHistory)
    private readonly callHistoryRepo: Repository<CallHistory>,
    private readonly logService: LogService,
    @InjectRepository(Agent)
    private readonly AgentRepo: Repository<Agent>,
  ) {}

  // async getCallStats(userId: string, date?: string) {
  //   console.log(
  //     `[getCallStats] Fetching call stats for userId: ${userId}, date: ${date}`,
  //   );
  //   const agent = await this.AgentRepo.findOne({
  //     where: { user: { id: userId } },
  //   });

  //   const retell_agent = agent?.retell_agent;
  //   const business = await this.businessRepo.findOne({
  //     where: { user_id: { id: userId } },
  //   });

  //   if (!business) {
  //     console.error(`[getCallStats] Business not found for userId: ${userId}`);
  //     throw new NotFoundException({
  //       statusCode: 404,
  //       message: 'Business not found for this user',
  //       error: 'Not Found',
  //     });
  //   }

  //   const businessHoursRaw = business.business_hours;
  //   const timezone = business.timezone || 'Asia/Karachi';

  //   if (!businessHoursRaw || !Array.isArray(businessHoursRaw)) {
  //     console.warn(`[getCallStats] Business hours not configured or invalid`);
  //     return {
  //       statusCode: 400,
  //       message: 'Business hours not configured correctly',
  //       data: [],
  //     };
  //   }

  //   const parsedHours = this.parseBusinessHours(businessHoursRaw);

  //   const targetDate = date ? new Date(date) : new Date();
  //   targetDate.setHours(0, 0, 0, 0);

  //   const dayOfWeek = targetDate
  //     .toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone })
  //     .toLowerCase();

  //   const hours = parsedHours[dayOfWeek];
  //   if (!hours || !hours.enabled) {
  //     return {
  //       statusCode: 200,
  //       message: `Business is closed on ${dayOfWeek}`,
  //       date: targetDate.toISOString().split('T')[0],
  //       timezone,
  //       hourlyStats: {},
  //     };
  //   }

  //   const [fromHour, fromMinute] = hours.from.split(':').map(Number);
  //   const [toHour, toMinute] = hours.to.split(':').map(Number);

  //   const start = new Date(targetDate);
  //   start.setHours(fromHour, fromMinute, 0, 0);

  //   const end = new Date(targetDate);
  //   if (hours.crossesMidnight) {
  //     end.setDate(end.getDate() + 1);
  //   }
  //   end.setHours(toHour, toMinute, 59, 999);

  //   const where: any = {
  //     start_timestamp: Between(start.getTime(), end.getTime()),
  //   };
  //   if (retell_agent) {
  //     where.retell_agent = retell_agent;
  //   }

  //   let calls: CallHistory[] = [];
  //   try {
  //     calls = await this.callHistoryRepo.find({ where });
  //   } catch (error) {
  //     console.error(`[getCallStats] Failed to fetch call history`, error);
  //     return {
  //       statusCode: 500,
  //       message: 'Failed to retrieve call history',
  //       error: error.message,
  //     };
  //   }

  //   const hourlyStatsRaw = this.groupCallsByHour(calls, timezone);
  //   console.log(hourlyStatsRaw, 'this is status of hourly stats Raw ');
  //   const hourlyStats = this.fillHourlyStats(hours, hourlyStatsRaw);
  //   console.log('[getCallStats] Final hourlyStats after fill:', hourlyStats);
  //   return {
  //     statusCode: 200,
  //     message: 'Call stats fetched successfully',
  //     date: targetDate.toISOString().split('T')[0],
  //     timezone,
  //     retell_agent,
  //     businessHours: { from: hours.from, to: hours.to },
  //     totalCalls: calls.length,
  //     hourlyStats,
  //   };
  // }
  async getAllStats(userId?: string, date?: string) {
    console.log(
      `[getAllStats] Fetching stats for userId: ${userId}, date: ${date}`,
    );

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const timezone = 'Asia/Karachi';
    let start: Date;
    let end: Date;
    let where: any = {};
    let businessHours = { from: '00:00', to: '23:59' };
    let retell_agent: string | undefined;

    if (userId) {
      // Regular user path
      const agent = await this.AgentRepo.findOne({
        where: { user: { id: userId } },
      });

      retell_agent = agent?.retell_agent;

      const business = await this.businessRepo.findOne({
        where: { user_id: { id: userId } },
      });

      if (!business) {
        console.error(`[getAllStats] Business not found for userId: ${userId}`);
        throw new NotFoundException({
          statusCode: 404,
          message: 'Business not found for this user',
          error: 'Not Found',
        });
      }

      const businessHoursRaw = business.business_hours;
      const businessTimezone = business.timezone || timezone;

      if (!businessHoursRaw || !Array.isArray(businessHoursRaw)) {
        console.warn(`[getAllStats] Business hours not configured or invalid`);
        return {
          statusCode: 400,
          message: 'Business hours not configured correctly',
          data: [],
        };
      }

      const parsedHours = this.parseBusinessHours(businessHoursRaw);
      const dayOfWeek = targetDate
        .toLocaleDateString('en-US', {
          weekday: 'long',
          timeZone: businessTimezone,
        })
        .toLowerCase();

      const hours = parsedHours[dayOfWeek];
      if (!hours || !hours.enabled) {
        return {
          statusCode: 200,
          message: `Business is closed on ${dayOfWeek}`,
          date: targetDate.toISOString().split('T')[0],
          timezone: businessTimezone,
          hourlyStats: {},
        };
      }

      businessHours = { from: hours.from, to: hours.to };

      const [fromHour, fromMinute] = hours.from.split(':').map(Number);
      const [toHour, toMinute] = hours.to.split(':').map(Number);

      start = new Date(targetDate);
      start.setHours(fromHour, fromMinute, 0, 0);

      end = new Date(targetDate);
      if (hours.crossesMidnight) end.setDate(end.getDate() + 1);
      end.setHours(toHour, toMinute, 59, 999);
    } else {
      // Admin path
      start = new Date(targetDate);
      start.setHours(0, 0, 0, 0);

      end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);
    }

    where.start_timestamp = Between(start.getTime(), end.getTime());
    if (retell_agent) where.retell_agent = retell_agent;

    let calls: CallHistory[] = [];
    try {
      calls = await this.callHistoryRepo.find({ where });
    } catch (error) {
      console.error(`[getAllStats] Failed to fetch call history`, error);
      return {
        statusCode: 500,
        message: 'Failed to retrieve call history',
        error: error.message,
      };
    }

    const hourlyStatsRaw = this.groupCallsByHour(calls, timezone);
    const hourlyStats = this.fillHourlyStats(businessHours, hourlyStatsRaw);

    return {
      statusCode: 200,
      message: 'Call stats fetched successfully',
      date: targetDate.toISOString().split('T')[0],
      timezone,
      isAdmin: !userId,
      retell_agent: retell_agent || undefined,
      businessHours,
      totalCalls: calls.length,
      hourlyStats,
    };
  }

  private fillHourlyStats(
    hours: { from: string; to: string },
    stats: Record<string, any>,
  ) {
    const result = {};
    const [fromHour] = hours.from.split(':').map(Number);
    const [toHour] = hours.to.split(':').map(Number);

    // Build a 24-hour range loop that wraps around midnight if needed
    let h = fromHour;
    do {
      const key = `${String(h).padStart(2, '0')}:00`;
      result[key] = stats[key] || {
        total: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
      };
      h = (h + 1) % 24; // Wrap around 24
    } while (h !== (toHour + 1) % 24); // Include `toHour` in the loop

    return result;
  }

  parseBusinessHours(rawHours: string[]): Record<string, any> {
    const result: Record<string, any> = {};

    rawHours.forEach((line) => {
      // Split only on the first colon (day: time)
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (!match) return;

      const day = match[1].trim().toLowerCase();
      const time = match[2].trim();

      if (!time) {
        result[day] = { enabled: false };
        return;
      }

      if (time.toLowerCase() === 'open 24 hours') {
        result[day] = {
          enabled: true,
          allDay: true,
          from: '00:00',
          to: '23:59',
        };
        return;
      }

      const [fromRaw, toRaw] = time.split('-').map((t) => t.trim());
      if (!fromRaw || !toRaw) {
        result[day] = { enabled: false };
        return;
      }

      const from = this.convertTo24Hour(fromRaw);
      const to = this.convertTo24Hour(toRaw);

      result[day] = {
        enabled: true,
        allDay: false,
        from,
        to,
        crossesMidnight: to < from,
      };
    });

    return result;
  }

  convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(/(AM|PM)/i);
    let [hours, minutes] = time.trim().split(':').map(Number);

    if (modifier.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (modifier.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }

  private groupCallsByHour(calls: CallHistory[], timezone: string) {
    const result = {};

    for (const call of calls) {
      const timestamp = Number(call.start_timestamp);
      if (isNaN(timestamp)) {
        console.warn(
          `[groupCallsByHour] Invalid timestamp:`,
          call.start_timestamp,
        );
        continue;
      }

      const date = new Date(timestamp);
      const localTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone,
      });

      const hour = localTime.split(':')[0] + ':00';
      console.log(`[groupCallsByHour] Call Timestamp: ${timestamp}`);
      console.log(
        `[groupCallsByHour] Local Time (${timezone}): ${localTime} → Hour: ${hour}`,
      );

      if (!result[hour]) {
        result[hour] = {
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
        };
      }

      result[hour].total++;

      const sentiment = call.call_analysis?.user_sentiment?.toLowerCase();
      if (['positive', 'negative', 'neutral'].includes(sentiment)) {
        result[hour][sentiment]++;
      } else {
        result[hour].neutral++; // fallback if sentiment missing
      }
    }

    return result;
  }

  async historyAndSave(): Promise<CallHistory[]> {
    const lastCallTimeUpdated = await this.getLastUpdateTimeStamp();
    const lastTimeStamp =
      Number(lastCallTimeUpdated?.start_timestamp) + 1 || 1736081191000;
    const upperThreshold = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService
          .post(
            `${process.env.RETELL_AI_API_URL}v2/list-calls`,
            {
              filter_criteria: {
                start_timestamp: {
                  lower_threshold: lastTimeStamp,
                  upper_threshold: upperThreshold,
                },
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.RETELL_AI_API_KEY}`,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(map((res) => res.data)),
      );

      const savedHistories: CallHistory[] = [];

      for (const call of response || []) {
        const newHistory = this.callHistoryRepo.create({
          id: uuidv4(),
          start_timestamp: call.start_timestamp,
          end_timestamp: call.end_timestamp,
          call_status: call.call_status,
          disconnection_reason: call.disconnection_reason,
          recording_url: call.recording_url,
          transcript_object: call.transcript_object,
          call_analysis: {
            call_summary: call.call_analysis?.call_summary,
            user_sentiment: call.call_analysis?.user_sentiment,
            call_successful: call.call_analysis?.call_successful,
          },
          latency: call.latency,
          call_cost: call.call_cost,
          retell_agent: call.agent_id,
        });

        const saved = await this.callHistoryRepo.save(newHistory);
        savedHistories.push(saved);
      }

      await this.logService.createLog({
        log_id: uuidv4(),
        start_timestamp: lastTimeStamp,
        end_timestamp: upperThreshold,
        records_loaded: savedHistories.length,
        status: savedHistories.length > 0 ? 'SUCCESS' : 'EMPTY',
        error_message:
          savedHistories.length > 0
            ? '1 new call log synced'
            : 'no call history to update',
      });

      return response;
    } catch (error) {
      console.error('Error saving call history:', error);

      await this.logService.createLog({
        log_id: uuidv4(),
        start_timestamp: lastTimeStamp,
        end_timestamp: Date.now(),
        records_loaded: 0,
        status: 'FAILED',
        error_message: error.message,
      });

      throw new InternalServerErrorException(
        'Failed to fetch or save call history.',
      );
    }
  }

  async getLastUpdateTimeStamp(): Promise<CallHistory | null> {
    try {
      const [latest] = await this.callHistoryRepo.find({
        order: { start_timestamp: 'DESC' },
        take: 1,
        select: ['start_timestamp'],
      });
      return latest || null;
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw new InternalServerErrorException('Failed to fetch call history.');
    }
  }

  // async getAllCallHistory(agentId?: string): Promise<CallHistory[]> {
  //   try {
  //     if (!agentId) return await this.callHistoryRepo.find();
  //     return await this.callHistoryRepo.find({
  //       where: { retell_agent: agentId },
  //     });
  //   } catch (error) {
  //     console.error('Error fetching call history:', error);
  //     throw new InternalServerErrorException('Failed to fetch call history.');
  //   }
  // }
  async getAllCallHistory(agentId?: string): Promise<any[]> {
    try {
      if (agentId) {
        // Return only that agent's calls
        return await this.callHistoryRepo.find({
          where: { retell_agent: agentId },
        });
      }

      // Get all call histories
      const allCalls = await this.callHistoryRepo.find();

      const enrichedCalls = await Promise.all(
        allCalls.map(async (call) => {
          const agent = await this.AgentRepo.findOne({
            where: { retell_agent: call.retell_agent },
            relations: ['user'], // Load the user relation here
          });

          const user = agent?.user ?? null;

          return {
            ...call,
            agentName: agent?.agent_name,
            userEmail: user?.email,
            userFirstName: user?.firstname,
            userLastName: user?.lastname,
          };
        }),
      );

      return enrichedCalls;
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw new InternalServerErrorException('Failed to fetch call history.');
    }
  }

  async SaveLogs() {
    await this.logService.createLog({
      log_id: uuidv4(),
      start_timestamp: 1234567890,
      end_timestamp: 1234567999,
      records_loaded: 81,
      status: 'SUCCESS',
    });
  }

  async calculateCallMetrics(calls: CallHistory[]): Promise<any> {
    try {
      let totalCallMinutes = 0;
      let totalCost = 0;
      let totalCalls = calls.length;
      let hangupReason: string[] = [];
      let userSentiments: string[] = [];
      const callDurationCategories = {
        shortCalls: 0,
        mediumCalls: 0,
        longCalls: 0,
      };

      calls.forEach((call) => {
        const durationSec = call.call_cost?.total_duration_seconds ?? 0;

        if (durationSec <= 30) {
          callDurationCategories.shortCalls++;
        } else if (durationSec <= 60) {
          callDurationCategories.mediumCalls++;
        } else {
          callDurationCategories.longCalls++;
        }
        if (call.call_cost?.total_duration_seconds) {
          totalCallMinutes += call.call_cost.total_duration_seconds / 60;
        }

        if (call.call_cost?.combined_cost) {
          totalCost += call.call_cost.combined_cost / 100;
        }
        if (call.disconnection_reason) {
          hangupReason.push(call.disconnection_reason);
        }
        if (call.call_analysis.user_sentiment) {
          userSentiments.push(call.call_analysis?.user_sentiment);
        }
      });

      const averageCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;

      return {
        totalCallMinutes,
        totalCost,
        averageCostPerCall,
        numberOfCalls: totalCalls,
        hangupReason,
        userSentiments,
        callDurationCategories,
      };
    } catch (error) {
      console.error('Error calculating call metrics:', error);
      throw new InternalServerErrorException(
        'Failed to calculate call metrics.',
      );
    }
  }

  async getAllData(duration: string, agentId?: string): Promise<any> {
    try {
      let days: number;
      switch (duration.toLowerCase()) {
        case '7-days':
          days = 6;
          break;
        case '15-days':
          days = 14;
          break;
        case '1-month':
          days = 30;
          break;
        case '1-year':
          days = 365;
          break;
        default:
          throw new BadRequestException(
            'Invalid duration format. Use "7-days", "1-month", or "1-year".',
          );
      }

      const now = new Date();
      const currentPeriodStart = new Date(now);
      currentPeriodStart.setDate(now.getDate() - days);

      const previousPeriodStart = new Date(currentPeriodStart);
      previousPeriodStart.setDate(currentPeriodStart.getDate() - days);
      let currentCalls, previousCalls;
      if (!agentId) {
        currentCalls = await this.callHistoryRepo.find({
          where: {
            start_timestamp: MoreThanOrEqual(currentPeriodStart.getTime()),
          },
        });
        previousCalls = await this.callHistoryRepo.find({
          where: {
            start_timestamp: Between(
              previousPeriodStart.getTime(),
              currentPeriodStart.getTime(),
            ),
          },
        });
      } else {
        currentCalls = await this.callHistoryRepo.find({
          where: {
            retell_agent: agentId,
            start_timestamp: MoreThanOrEqual(currentPeriodStart.getTime()),
          },
        });
        previousCalls = await this.callHistoryRepo.find({
          where: {
            retell_agent: agentId,
            start_timestamp: Between(
              previousPeriodStart.getTime(),
              currentPeriodStart.getTime(),
            ),
          },
        });
      }

      const currentMetrics = await this.calculateCallMetrics(currentCalls);
      const previousMetrics = await this.calculateCallMetrics(previousCalls);

      const percentDiff = (current: number, previous: number): number => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        totalCallMinutes: {
          callMinutes: currentMetrics.totalCallMinutes,
          diff: percentDiff(
            currentMetrics.totalCallMinutes,
            previousMetrics.totalCallMinutes,
          ),
        },
        totalCost: {
          Cost: currentMetrics.totalCost,
          diff: percentDiff(
            currentMetrics.totalCost,
            previousMetrics.totalCost,
          ),
        },
        averageCostPerCall: {
          averageCost: currentMetrics.averageCostPerCall,
          diff: percentDiff(
            currentMetrics.averageCostPerCall,
            previousMetrics.averageCostPerCall,
          ),
        },
        numberOfCalls: {
          totalCalls: currentMetrics.numberOfCalls,
          diff: percentDiff(
            currentMetrics.numberOfCalls,
            previousMetrics.numberOfCalls,
          ),
        },
        hangupReason: currentMetrics.hangupReason,
        userSentiments: currentMetrics.userSentiments,
        callDurationCategories: currentMetrics.callDurationCategories,
      };
    } catch (error) {
      console.error('Error fetching or calculating call metrics:', error);
      throw new InternalServerErrorException(
        'Failed to fetch or calculate call metrics.',
      );
    }
  }

  async getAllDataForCustomRange(
    start: string,
    end: string,
    agentId?: string,
  ): Promise<any> {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid start or end date');
      }

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      let currentCalls;

      if (!agentId) {
        currentCalls = await this.callHistoryRepo.find({
          where: {
            start_timestamp: Between(startDate.getTime(), endDate.getTime()),
          },
        });
      } else {
        currentCalls = await this.callHistoryRepo.find({
          where: {
            retell_agent: agentId,
            start_timestamp: Between(startDate.getTime(), endDate.getTime()),
          },
        });
      }

      const currentMetrics = await this.calculateCallMetrics(currentCalls);

      return {
        totalCallMinutes: {
          callMinutes: currentMetrics.totalCallMinutes,
          diff: 0, // Optional: can be left 0 or null for custom
        },
        totalCost: {
          Cost: currentMetrics.totalCost,
          diff: 0,
        },
        averageCostPerCall: {
          averageCost: currentMetrics.averageCostPerCall,
          diff: 0,
        },
        numberOfCalls: {
          totalCalls: currentMetrics.numberOfCalls,
          diff: 0,
        },
        hangupReason: currentMetrics.hangupReason,
        userSentiments: currentMetrics.userSentiments,
        callDurationCategories: currentMetrics.callDurationCategories,
      };
    } catch (error) {
      console.error('Error fetching custom range call metrics:', error);
      throw new InternalServerErrorException(
        'Failed to fetch call metrics for custom range.',
      );
    }
  }

  async calculateDayWiseTotalCost(
    calls: CallHistory[],
    startTimestamp: number,
    endTimestamp: number,
    metric: 'total-cost' | 'total-calls' | 'average-cost' | 'call-minutes',
    groupBy: 'day' | 'month' = 'day',
  ): Promise<any[]> {
    try {
      const groupedData: {
        [key: string]: {
          totalCost: number;
          callCount: number;
          totalDurationSec: number;
        };
      } = {};

      // Step 1: Pre-fill the full range
      const startDate = new Date(startTimestamp);
      const endDate = new Date(endTimestamp);
      const current = new Date(startDate);

      while (
        (groupBy === 'month' &&
          (current.getFullYear() < endDate.getFullYear() ||
            (current.getFullYear() === endDate.getFullYear() &&
              current.getMonth() <= endDate.getMonth()))) ||
        (groupBy === 'day' && current <= endDate)
      ) {
        const key =
          groupBy === 'month'
            ? `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
            : current.toISOString().split('T')[0];

        groupedData[key] = {
          totalCost: 0,
          callCount: 0,
          totalDurationSec: 0,
        };

        if (groupBy === 'month') {
          // Move to the next month and check if it's beyond 12 months from the start date
          current.setMonth(current.getMonth() + 1);

          // If we passed 12 months, stop the loop
          if (
            current.getFullYear() > startDate.getFullYear() + 1 ||
            (current.getFullYear() === startDate.getFullYear() + 1 &&
              current.getMonth() > startDate.getMonth())
          ) {
            break;
          }
        } else {
          // For daily grouping, simply move to the next day
          current.setDate(current.getDate() + 1);
        }
      }

      // Step 2: Add call data into groups
      calls.forEach((call) => {
        let timestamp = call.start_timestamp;
        if (typeof timestamp === 'string') timestamp = parseInt(timestamp, 10);
        if (isNaN(timestamp)) return;

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return;

        const key =
          groupBy === 'month'
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            : date.toISOString().split('T')[0];

        const cost = call.call_cost?.combined_cost || 0;
        const duration = call.call_cost?.total_duration_seconds || 0;

        if (!groupedData[key]) {
          groupedData[key] = {
            totalCost: 0,
            callCount: 0,
            totalDurationSec: 0,
          };
        }

        groupedData[key].totalCost += cost;
        groupedData[key].callCount += 1;
        groupedData[key].totalDurationSec += duration;
      });

      // Step 3: Format the results in order
      const sortedKeys = Object.keys(groupedData).sort();
      const results = sortedKeys.map((key) => {
        const data = groupedData[key];
        let value: number;

        switch (metric) {
          case 'total-cost':
            value = data.totalCost;
            break;
          case 'total-calls':
            value = data.callCount;
            break;
          case 'average-cost':
            value = data.callCount
              ? parseFloat((data.totalCost / data.callCount).toFixed(2))
              : 0;
            break;
          case 'call-minutes':
            value = parseFloat((data.totalDurationSec / 60).toFixed(2));
            break;
          default:
            throw new BadRequestException('Invalid metric type');
        }

        return { date: key, value };
      });

      return results;
    } catch (error) {
      console.error('Error calculating grouped data:', error);
      throw new InternalServerErrorException(
        'Failed to calculate grouped data.',
      );
    }
  }

  async getDayWiseTotalCostForDuration(
    duration: string,
    value,
    agentId?: string,
  ): Promise<any[]> {
    try {
      const startDate = this.calculateStartDate(duration);
      const startTimestamp = startDate.getTime();
      const endTimestamp = new Date().getTime();
      let callHistory;
      if (!agentId) {
        callHistory = await this.callHistoryRepo.find({
          where: {
            start_timestamp: And(
              MoreThanOrEqual(startTimestamp),
              LessThanOrEqual(endTimestamp),
            ),
          },
        });
      } else {
        callHistory = await this.callHistoryRepo.find({
          where: {
            retell_agent: agentId,
            start_timestamp: And(
              MoreThanOrEqual(startTimestamp),
              LessThanOrEqual(endTimestamp),
            ),
          },
        });
      }

      const groupBy = duration === '1-year' ? 'month' : 'day';

      return await this.calculateDayWiseTotalCost(
        callHistory,
        startTimestamp,
        endTimestamp,
        value,
        groupBy,
      );
    } catch (error) {
      console.error('Error fetching or calculating total call cost:', error);
      throw new InternalServerErrorException(
        'Failed to fetch or calculate call cost.',
      );
    }
  }

  async getDayWiseTotalCostForCustomRange(
    start: string,
    end: string,
    value: string,
    agentId?: string,
  ): Promise<any[]> {
    try {
      const allowedValues = [
        'total-cost',
        'total-calls',
        'average-cost',
        'call-minutes',
      ] as const;

      if (!allowedValues.includes(value as any)) {
        throw new BadRequestException('Invalid metric type');
      }

      const metric = value as (typeof allowedValues)[number]; // ✅ Narrow to exact literal union

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid start or end date');
      }

      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime();

      let callHistory;
      if (!agentId) {
        callHistory = await this.callHistoryRepo.find({
          where: {
            start_timestamp: And(
              MoreThanOrEqual(startTimestamp),
              LessThanOrEqual(endTimestamp),
            ),
          },
        });
      } else {
        callHistory = await this.callHistoryRepo.find({
          where: {
            retell_agent: agentId,
            start_timestamp: And(
              MoreThanOrEqual(startTimestamp),
              LessThanOrEqual(endTimestamp),
            ),
          },
        });
      }

      const diffInDays = Math.floor(
        (endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24),
      );
      const groupBy = diffInDays > 60 ? 'month' : 'day';

      return await this.calculateDayWiseTotalCost(
        callHistory,
        startTimestamp,
        endTimestamp,
        metric, // ✅ now this is correctly typed
        groupBy,
      );
    } catch (error) {
      console.error('Error in getDayWiseTotalCostForCustomRange:', error);
      throw new InternalServerErrorException(
        'Failed to fetch call cost for custom range.',
      );
    }
  }

  private calculateStartDate(duration: string): Date {
    const startDate = new Date();

    switch (duration.toLowerCase()) {
      case '1-day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7-days':
        startDate.setDate(startDate.getDate() - 6);
        break;
      case '15-days':
        startDate.setDate(startDate.getDate() - 14);
        break;
      case '1-month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3-months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '1-year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        throw new BadRequestException(
          'Invalid duration format. Use "1-day", "7-days", "15-days", "1-month", "3-months", or "1-year".',
        );
    }

    return startDate;
  }
}
