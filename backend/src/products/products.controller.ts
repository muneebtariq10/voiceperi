import { Controller, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Post('lookup')
  async lookupProduct(@Body() body: any) {
    const rawQuery =
      body?.query ??
      body?.keyword ??
      body?.product ??
      body?.product_name ??
      body?.item_number ??
      body?.model ??
      body?.sku ??
      body?.args?.query ??
      body?.args?.keyword ??
      body?.args?.product ??
      body?.args?.product_name ??
      body?.arguments?.query ??
      body?.arguments?.keyword ??
      body?.arguments?.product ??
      body?.arguments?.product_name ??
      (typeof body === 'string' ? body : undefined);

    return this.productsService.lookupProduct(rawQuery);
  }
}
