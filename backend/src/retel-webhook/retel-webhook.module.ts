// retel-webhook.module.ts
import { Module } from '@nestjs/common';
import { RetelWebhookController } from './retel-webhook.controller';
import { RetelWebhookService } from './retel-webhook.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { AgentsModule } from '../agents/agents.module'; // ✅ Import this
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../entities/agent'; // adjust path
import { BusinessInformation } from 'src/entities/business_information';
@Module({
  imports: [
    AgentsModule,
    BusinessInformation, // ✅ Import the module that provides AgentsService
    MailerModule,
    TypeOrmModule.forFeature([Agent]),
    TypeOrmModule.forFeature([BusinessInformation]),
  ],
  controllers: [RetelWebhookController],
  providers: [RetelWebhookService],
})
export class RetelWebhookModule {}
