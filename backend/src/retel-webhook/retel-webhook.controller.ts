import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { RetelWebhookService } from './retel-webhook.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('retell-webhook')
export class RetelWebhookController {
  constructor(private readonly retelWebhookService: RetelWebhookService) {}

  @Public()
  @Post()
  @HttpCode(200)
  async handleRetelWebhook(@Body() payload: any) {
    return this.retelWebhookService.processWebhook(payload);
  }
}
