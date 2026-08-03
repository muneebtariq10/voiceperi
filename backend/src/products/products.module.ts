import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../entities/product';
import { OpenCartProductAdapter } from '../integrations/adapters';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, OpenCartProductAdapter],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
