// src/places/places.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user';
import { Agent } from 'src/entities/agent';
import { BusinessInformation } from 'src/entities/business_information';
import { ShopifyOrderAdapter } from './adapters/shopify-order.adapter';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([User, Agent, BusinessInformation])],
  controllers: [IntegrationController],
  providers: [IntegrationService, ShopifyOrderAdapter],
})
export class IntegrationModule {}
