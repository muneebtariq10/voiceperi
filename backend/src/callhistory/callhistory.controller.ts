import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CallHistoryService } from './callhistory.service';
import { AgentsService } from 'src/agents/agents.service';
import { Public } from 'src/auth/decorators/public.decorator';
@Controller('call-history')
export class CallHistoryController {
  constructor(
    private readonly callHistoryService: CallHistoryService,
    private readonly agentsService: AgentsService,
  ) {}

  @Public()
  @Get('/refresh')
  async getCallHistory() {
    const response = await this.callHistoryService.historyAndSave();
    if (response.length == 0) {
      return {
        statuscode: 401,
        message: 'no more updated call history avaialbe ',
      };
    }
    return response;
  }

  @Public()
  @Get('/business')
  async getCallSummary(
    @Query('userId') userId: string,
    @Query('date') date?: string,
  ) {
    return await this.callHistoryService.getAllStats(userId, date);
  }

  @Public()
  @Get()
  async getAllCallHistory(@Query('id') userId?: string) {
    console.log(userId, 'here is user id ');
    if (!userId) {
      // No ID provided – return all call history
      return await this.callHistoryService.getAllCallHistory(); // Or whatever method returns all rows
    }
    console.log(userId, 'here is user id ');
    // ID provided – return specific user's call history
    const retel_agent = await this.agentsService.findOne(userId);
    const retel_id = retel_agent.retell_agent;
    return this.callHistoryService.getAllCallHistory(retel_id);
  }

  @Get('overview-charts')
  async getDayWiseTotalCostForDuration(
    @Query('user_id') userId: string,
    @Query('duration') duration: string,
    @Query('value') value: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const isCustom = start && end;

    if (!userId) {
      if (isCustom) {
        return this.callHistoryService.getDayWiseTotalCostForCustomRange(
          start,
          end,
          value,
        );
      } else {
        return this.callHistoryService.getDayWiseTotalCostForDuration(
          duration,
          value,
        );
      }
    }

    const agent = await this.agentsService.findOne(userId);
    if (!agent || !agent.retell_agent) {
      throw new BadRequestException(
        'No associated Retell agent found for this user',
      );
    }

    const retellAgentId = agent.retell_agent;

    if (isCustom) {
      return this.callHistoryService.getDayWiseTotalCostForCustomRange(
        start,
        end,
        value,
        retellAgentId,
      );
    }

    return this.callHistoryService.getDayWiseTotalCostForDuration(
      duration,
      value,
      retellAgentId,
    );
  }

  @Get('overview')
  async getAllData(
    @Query('user_id') userId: string,
    @Query('duration') duration: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const isCustom = start && end;

    if (!userId) {
      if (isCustom) {
        return this.callHistoryService.getAllDataForCustomRange(start, end);
      } else {
        return this.callHistoryService.getAllData(duration);
      }
    }

    const agent = await this.agentsService.findOne(userId);
    if (!agent || !agent.retell_agent) {
      throw new BadRequestException(
        'No associated Retell agent found for this user',
      );
    }

    const retellAgentId = agent.retell_agent;

    if (isCustom) {
      return this.callHistoryService.getAllDataForCustomRange(
        start,
        end,
        retellAgentId,
      );
    }

    return this.callHistoryService.getAllData(duration, retellAgentId);
  }
}
