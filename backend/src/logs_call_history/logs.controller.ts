import { Controller, Get } from '@nestjs/common';
import { LogService } from './logs.service';
import { Log } from '../entities/logs';
import { Public } from 'src/auth/decorators/public.decorator';
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Public()
  @Get('/updated-time')
  async getLog(): Promise<Log | null> {
    return await this.logService.getLog();
  }

  @Get('/all')
  async getAllLog(): Promise<Log[] | null> {
    return await this.logService.getAllLog();
  }
}
