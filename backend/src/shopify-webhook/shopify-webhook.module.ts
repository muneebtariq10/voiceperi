import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopifyWebhookController } from './shopify-webhook.controller';
import { ShopifyWebhookService } from './shopify-webhook.service';
import { BusinessInformation } from '../entities/business_information';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessInformation]), ProductsModule],
  controllers: [ShopifyWebhookController],
  providers: [ShopifyWebhookService],
  exports: [ShopifyWebhookService],
})
export class ShopifyWebhookModule {}
