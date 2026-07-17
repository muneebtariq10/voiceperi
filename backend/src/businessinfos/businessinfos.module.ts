import { forwardRef, Module } from '@nestjs/common';
import { BusinessinfosService } from './businessinfos.service';
import { BusinessinfosController } from './businessinfos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessInformation } from 'src/entities/business_information';
import { HttpModule } from '@nestjs/axios';
import { AgentsModule } from 'src/agents/agents.module';
import { Agent } from 'src/entities/agent';

import { WebsiteImportService } from './website-import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessInformation, Agent]),
    HttpModule,
    forwardRef(() => AgentsModule),
  ],
  controllers: [BusinessinfosController],
  providers: [BusinessinfosService, WebsiteImportService],
  exports: [TypeOrmModule, BusinessinfosService, WebsiteImportService],
})
export class BusinessinfosModule {}
