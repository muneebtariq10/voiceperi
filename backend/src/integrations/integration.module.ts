// src/places/places.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { Agent } from 'src/entities/agent';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([User, Agent])
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService],
})
export class IntegrationModule { }
