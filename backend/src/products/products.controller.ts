import { Controller, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Post('lookup')
  async lookupProduct(@Body() body: { query: string }) {
    return this.productsService.lookupProduct(body.query);
  }
}
