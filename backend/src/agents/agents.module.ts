import { forwardRef, Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from 'src/entities/language';
import { Agent } from 'src/entities/agent';
import { UsersModule } from 'src/users/users.module';
import { BusinessinfosModule } from 'src/businessinfos/businessinfos.module';
import { UsageModule } from 'src/UsedMinutes/usedminutes.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([Language, Agent]),
    forwardRef(() => UsersModule),
    forwardRef(() => BusinessinfosModule),
    UsageModule
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule { }
