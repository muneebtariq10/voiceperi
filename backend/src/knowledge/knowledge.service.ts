import { Injectable, Logger } from '@nestjs/common';
import { PrintEZKnowledgeAdapter } from '../integrations/adapters';
import { KnowledgeQueryResult } from '../integrations/interfaces';

export interface KnowledgeQueryRequest {
  topic?: string;
  question?: string;
  category?: string;
}

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(private readonly knowledgeAdapter: PrintEZKnowledgeAdapter) {}

  async handleKnowledgeQuery(
    request: KnowledgeQueryRequest,
  ): Promise<KnowledgeQueryResult> {
    this.logger.log(
      `📖 Executing knowledge base search — Topic: [${request.topic || 'none'}], Question: [${request.question || 'none'}]`,
    );

    const targetTopic = request.topic || request.category || '';
    return this.knowledgeAdapter.queryKnowledge(targetTopic, request.question);
  }
}
