import { Controller, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('lookup')
  async lookupProduct(@Body() body: { query: string }) {
    return this.productsService.lookupProduct(body.query);
  }
}
