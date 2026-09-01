import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShopifyWebhookService } from './shopify-webhook.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('shopify-webhook')
export class ShopifyWebhookController {
  constructor(private readonly webhookService: ShopifyWebhookService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-shopify-topic') topic: string,
    @Headers('x-shopify-shop-domain') shopDomain: string,
    @Headers('x-shopify-hmac-sha256') hmacHeader: string,
    @Req() req: any,
  ) {
    return await this.webhookService.handleWebhook(
      topic,
      shopDomain,
      payload,
      hmacHeader,
      req.rawBody || JSON.stringify(payload),
    );
  }
}
