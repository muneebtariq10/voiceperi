import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../entities/logs';
import { UUID } from 'crypto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  // Called internally from other services
  async createLog(data: {
    log_id: string;
    start_timestamp: number;
    end_timestamp: number;
    records_loaded: number;
    status: string;
    error_message?: string;
  }): Promise<Log> {
    const newLog = this.logRepository.create(data);
    return await this.logRepository.save(newLog);
  }

  // GET by log_id
  async getLog(): Promise<Log> {
    try {
      const [latest] = await this.logRepository.find({
        order: { createdAt: 'DESC' },
        take: 1,
        select: ['createdAt'],
      });
      return latest || null;
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw new InternalServerErrorException('Failed to fetch call history.');
    }
  }
  async getAllLog(): Promise<Log[]> {
    try {
      const latest = await this.logRepository.find({
        order: { createdAt: 'DESC' },
      });
      return latest || null;
    } catch (error) {
      console.error('Error fetching all call history logs:', error);
      throw new InternalServerErrorException('Failed to fetch call history.');
    }
  }
}
