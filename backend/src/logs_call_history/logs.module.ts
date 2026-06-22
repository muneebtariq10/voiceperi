import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from '../entities/logs';
import { LogService } from './logs.service';
import { LogController } from './logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService], // Export so it can be used in other modules
})
export class LogModule {}
