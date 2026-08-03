import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { PrintEZKnowledgeAdapter } from '../integrations/adapters';

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, PrintEZKnowledgeAdapter],
  exports: [KnowledgeService, PrintEZKnowledgeAdapter],
})
export class KnowledgeModule {}
