import { Module } from '@nestjs/common';
import { CallHistoryService } from './callhistory.service';
import { CallHistoryController } from './callhistory.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallHistory } from 'src/entities/call_history';
import { UsersModule } from 'src/users/users.module';
import { AgentsModule } from 'src/agents/agents.module';
import { LogModule } from '../logs_call_history/logs.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([CallHistory]),
    UsersModule,
    AgentsModule,
    LogModule,
  ],
  controllers: [CallHistoryController],
  providers: [CallHistoryService],
})
export class CallHistoryModule {}
