import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('knowledge')
export class KnowledgeController {
  private readonly logger = new Logger(KnowledgeController.name);

  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Public()
  @Post('query')
  @HttpCode(HttpStatus.OK)
  async queryKnowledgeBase(@Body() body: any) {
    const topic =
      body?.topic ??
      body?.args?.topic ??
      body?.arguments?.topic ??
      body?.category ??
      body?.args?.category ??
      body?.arguments?.category ??
      undefined;

    const question =
      body?.question ??
      body?.args?.question ??
      body?.arguments?.question ??
      body?.query ??
      body?.args?.query ??
      body?.arguments?.query ??
      undefined;

    this.logger.log(
      `📥 Knowledge query webhook invoked — Topic: [${topic}], Question: [${question}]`,
    );

    if (!topic && !question) {
      return {
        found: false,
        topic: 'General Assistance',
        answer:
          'Could you please clarify what printing specification, shipping turnaround, or account policy you would like to know about?',
      };
    }

    return this.knowledgeService.handleKnowledgeQuery({
      topic,
      question,
    });
  }
}
