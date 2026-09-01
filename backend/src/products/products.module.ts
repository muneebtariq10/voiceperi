import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../entities/product';
import { BusinessInformation } from '../entities/business_information';
import {
  OpenCartProductAdapter,
  ShopifyProductAdapter,
} from '../integrations/adapters';

@Module({
  imports: [TypeOrmModule.forFeature([Product, BusinessInformation])],
  providers: [
    ProductsService,
    OpenCartProductAdapter,
    ShopifyProductAdapter,
  ],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
